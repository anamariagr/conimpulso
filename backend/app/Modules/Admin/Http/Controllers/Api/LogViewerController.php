<?php

namespace App\Modules\Admin\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Admin\Support\LaravelLogReader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogViewerController extends ApiController
{
    private const DEFAULT_PER_PAGE = 50;

    private const MAX_PER_PAGE = 200;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'level' => ['sometimes', 'array'],
            'level.*' => ['string', 'max:20'],
            'from' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'to' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'q' => ['sometimes', 'nullable', 'string', 'max:200'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ]);

        $reader = $this->reader();
        $entries = $reader->entries();

        // Los niveles se calculan sobre el set completo para que los chips del
        // filtro no desaparezcan cuando el usuario ya filtró por uno.
        $levels = array_values(array_unique(array_column($entries, 'level')));
        sort($levels);

        $filtered = $this->filter($entries, $validated);

        $perPage = (int) ($validated['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($validated['page'] ?? 1);
        $total = count($filtered);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => array_slice($filtered, ($page - 1) * $perPage, $perPage),
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'levels' => $levels,
                'file_exists' => $reader->exists(),
                'file_size' => $reader->sizeInBytes(),
                'truncated' => $reader->isTruncated(),
            ],
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $entries
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    private function filter(array $entries, array $filters): array
    {
        $levels = array_map('strtoupper', $filters['level'] ?? []);
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;
        $needle = isset($filters['q']) && $filters['q'] !== '' ? mb_strtolower($filters['q']) : null;

        $matches = array_filter($entries, function (array $entry) use ($levels, $from, $to, $needle): bool {
            if ($levels !== [] && ! in_array($entry['level'], $levels, true)) {
                return false;
            }

            // Comparación de fechas como string: 'Y-m-d' ordena lexicográficamente.
            if ($from !== null && $entry['date'] < $from) {
                return false;
            }

            if ($to !== null && $entry['date'] > $to) {
                return false;
            }

            if ($needle !== null) {
                $haystack = mb_strtolower($entry['message'].' '.$entry['context'].' '.$entry['trace']);

                if (! str_contains($haystack, $needle)) {
                    return false;
                }
            }

            return true;
        });

        return array_values($matches);
    }

    private function reader(): LaravelLogReader
    {
        $path = config('logging.channels.single.path') ?: storage_path('logs/laravel.log');

        return new LaravelLogReader($path);
    }
}
