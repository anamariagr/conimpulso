<?php

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Services\UserImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserImportController extends ApiController
{
    public function __construct(
        private UserImportService $importService
    ) {}

    public function downloadTemplate(): JsonResponse
    {
        $template = $this->importService->getTemplate();

        return response()->json([
            'columns' => array_keys($template),
            'example' => array_values($template),
            'required' => ['name', 'email', 'password'],
            'optional' => ['phone', 'role'],
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->storeAs('imports', $file->getClientOriginalName());

        $results = $this->importService->importFromCsv(
            storage_path('app/' . $path),
            $request->user()->id
        );

        return response()->json([
            'message' => 'Importación completada',
            'imported' => $results['imported'],
            'failed' => $results['failed'],
            'errors' => $results['errors'],
        ]);
    }
}