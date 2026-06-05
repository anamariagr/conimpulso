<?php

namespace App\Modules\Messages\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Services\ContactProtectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProtectedMessagesController extends ApiController
{
    public function __construct(
        private ContactProtectionService $protectionService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'content' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        $content = $validated['content'];

        // Check for contact evasion before saving
        if ($this->protectionService->containsEvasionAttempt($content)) {
            return response()->json([
                'message' => 'Tu mensaje no puede ser enviado. Parece que intentas compartir información de contacto.',
                'error' => 'contact_protection',
            ], 422);
        }

        // Sanitize phone numbers
        $result = $this->protectionService->sanitizeContent($content, $user->id);
        $sanitizedContent = $result['sanitized'];

        // Create the message
        $message = \App\Modules\Messages\Models\Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $validated['recipient_id'],
            'content' => $sanitizedContent,
            'is_read' => false,
        ]);

        return response()->json([
            'data' => $message,
            'protection_flags' => $result['flags'] ?? [],
        ], 201);
    }

    public function blockContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $currentUser = $request->user();

        $existingBlock = \App\Models\ContactBlock::where('user_id', $currentUser->id)
            ->where('blocked_user_id', $validated['user_id'])
            ->first();

        if ($existingBlock) {
            return response()->json([
                'message' => 'Este usuario ya está bloqueado',
            ], 422);
        }

        $block = \App\Models\ContactBlock::create([
            'user_id' => $currentUser->id,
            'blocked_user_id' => $validated['user_id'],
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'data' => $block,
            'message' => 'Usuario bloqueado exitosamente',
        ], 201);
    }

    public function unblockContact(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();

        $block = \App\Models\ContactBlock::where('user_id', $currentUser->id)
            ->where('blocked_user_id', $userId)
            ->first();

        if (!$block) {
            return response()->json([
                'message' => 'Este usuario no está bloqueado',
            ], 404);
        }

        $block->delete();

        return response()->json([
            'message' => 'Usuario desbloqueado exitosamente',
        ]);
    }

    public function blockedContacts(Request $request): JsonResponse
    {
        $user = $request->user();

        $blocks = \App\Models\ContactBlock::where('user_id', $user->id)
            ->with('blockedUser:id,name,email,avatar')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $blocks,
        ]);
    }
}