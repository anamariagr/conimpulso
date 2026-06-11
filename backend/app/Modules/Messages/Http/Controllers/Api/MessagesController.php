<?php

namespace App\Modules\Messages\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Messages\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class MessagesController extends Controller
{
    public function inbox(Request $request): JsonResponse
    {
        $messages = Message::with('sender')
            ->where('receiver_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
        ]);
    }

    public function sent(Request $request): JsonResponse
    {
        $messages = Message::with('receiver')
            ->where('sender_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'attachment' => ['nullable', 'file', 'max:10240'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $sender = $request->user();
        $receiver = \App\Modules\Auth\Models\User::findOrFail($request->receiver_id);

        if ($request->receiver_id === $sender->id) {
            return $this->errorResponse('No puedes enviarte un mensaje a ti mismo', 422);
        }

        if (!$sender->canSendMessages()) {
            return $this->errorResponse(
                'Tu mensajería está deshabilitada. Contacta al administrador.',
                403,
                ['messaging_enabled' => false, 'reason' => $sender->messaging_disabled_reason]
            );
        }

        if (!$receiver->canReceiveMessages()) {
            return $this->errorResponse(
                'El destinatario no puede recibir mensajes actualmente',
                403,
                ['recipient_messaging_enabled' => false]
            );
        }

        $data = [
            'sender_id' => $sender->id,
            'receiver_id' => $request->receiver_id,
            'subject' => $request->subject,
            'body' => $request->body,
        ];

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('messages/attachments', 'public');
            $data['attachment_path'] = $path;
            $data['attachment_name'] = $request->file('attachment')->getClientOriginalName();
        }

        $message = Message::create($data);

        return $this->successResponse($message, 'Mensaje enviado', 201);
    }

    public function show(int $id): JsonResponse
    {
        $message = Message::with(['sender', 'receiver'])->findOrFail($id);

        if ($message->receiver_id !== request()->user()->id && $message->sender_id !== request()->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        if (!$message->is_read && $message->receiver_id === request()->user()->id) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        if ($message->receiver_id !== request()->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $this->successResponse($message, 'Mensaje marcado como leído');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Message::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse(null, 'Todos los mensajes marcados como leídos');
    }

    public function destroy(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        if ($message->sender_id !== request()->user()->id && $message->receiver_id !== request()->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        if ($message->attachment_path) {
            Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        return $this->successResponse(null, 'Mensaje eliminado');
    }
}