<?php

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('messaging_enabled')) {
            $query->where('messaging_enabled', $request->boolean('messaging_enabled'));
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $perPage = min($request->integer('per_page', 25), 100);
        $users = $query->with('roles:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $data = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'messaging_enabled' => (bool) $user->messaging_enabled,
                'messaging_disabled_at' => $user->messaging_disabled_at,
                'messaging_disabled_reason' => $user->messaging_disabled_reason,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'roles' => $user->roles->pluck('name'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with('roles:id,name')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'messaging_enabled' => (bool) $user->messaging_enabled,
                'messaging_disabled_at' => $user->messaging_disabled_at,
                'messaging_disabled_reason' => $user->messaging_disabled_reason,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'roles' => $user->roles->pluck('name'),
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,inactive,suspended,pending',
            'messaging_enabled' => 'sometimes|boolean',
            'messaging_disabled_reason' => 'sometimes|nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('status')) {
            $user->status = $request->status;
        }

        if ($request->has('messaging_enabled')) {
            if ($request->boolean('messaging_enabled')) {
                $user->enableMessaging();
            } else {
                $user->disableMessaging(
                    $request->user()->id,
                    $request->messaging_disabled_reason
                );
            }
        } else {
            $user->save();
        }

        return response()->json([
            'success' => true,
            'data' => $user->fresh('roles:id,name'),
            'message' => 'Usuario actualizado',
        ]);
    }

    public function enableMessaging(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->enableMessaging();

        return response()->json([
            'success' => true,
            'data' => $user->fresh(),
            'message' => 'Mensajería habilitada para el usuario',
        ]);
    }

    public function disableMessaging(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->disableMessaging($request->user()->id, $request->reason);

        return response()->json([
            'success' => true,
            'data' => $user->fresh(),
            'message' => 'Mensajería deshabilitada para el usuario',
        ]);
    }

    public function messagingStats(): JsonResponse
    {
        $total = User::count();
        $enabled = User::where('messaging_enabled', true)->count();
        $disabled = User::where('messaging_enabled', false)->count();
        $activeAndEnabled = User::where('messaging_enabled', true)
            ->where('status', 'active')
            ->count();

        $recentlyDisabled = User::where('messaging_enabled', false)
            ->whereNotNull('messaging_disabled_at')
            ->with('messagingDisabledBy:id,name')
            ->orderBy('messaging_disabled_at', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email', 'messaging_disabled_at', 'messaging_disabled_reason', 'messaging_disabled_by']);

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $total,
                'messaging_enabled' => $enabled,
                'messaging_disabled' => $disabled,
                'active_and_enabled' => $activeAndEnabled,
                'recently_disabled' => $recentlyDisabled,
            ],
        ]);
    }
}
