<?php

namespace App\Modules\Messages\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\ContactProtectionService;

class ContactProtectionMiddleware
{
    public function __construct(
        private ContactProtectionService $protectionService
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $content = $request->get('content') ?? $request->get('message') ?? '';

        if (!empty($content) && strlen($content) > 10) {
            $result = $this->protectionService->sanitizeContent($content, $request->user()->id ?? 0);

            if ($result['blocked']) {
                return response()->json([
                    'message' => 'Tu mensaje fue bloqueado por protección de datos.',
                    'error' => 'contact_protection',
                    'flags' => $result['flags'],
                ], 422);
            }

            if (!empty($result['flags'])) {
                $request->merge([
                    'content' => $result['sanitized'],
                    '_protection_flags' => $result['flags'],
                ]);
            }
        }

        return $next($request);
    }
}