<?php

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Models\UserActivity;
use App\Modules\Auth\Models\IdentityVerification;
use App\Modules\Auth\Models\NotificationPreference;
use App\Modules\Auth\Models\PrivacySetting;
use App\Modules\Auth\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSettingsController extends ApiController
{
    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['privacySetting', 'notificationPreferences']);

        return response()->json([
            'data' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'bio' => 'sometimes|nullable|string|max:500',
            'location' => 'sometimes|nullable|string|max:255',
            'website' => 'sometimes|nullable|url|max:255',
            'avatar' => 'sometimes|nullable|image|max:2048',
        ]);

        $user = $request->user();
        $user->update($validated);

        $this->logActivity($user->id, 'profile_update', 'Perfil actualizado');

        return response()->json([
            'data' => $user,
            'message' => 'Perfil actualizado exitosamente',
        ]);
    }

    public function identityVerificationRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => 'required|in:cc,ce,passport,nit,rut',
            'document_number' => 'required|string|max:50',
            'front_image' => 'required|image|max:5120',
            'back_image' => 'sometimes|image|max:5120',
            'selfie_image' => 'sometimes|image|max:5120',
        ]);

        $user = $request->user();

        $existing = IdentityVerification::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Ya existe una verificación en proceso o aprobada',
            ], 422);
        }

        $verification = IdentityVerification::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'front_image' => $validated['front_image']->store('verifications', 'public'),
            'back_image' => isset($validated['back_image']) ? $validated['back_image']->store('verifications', 'public') : null,
            'selfie_image' => isset($validated['selfie_image']) ? $validated['selfie_image']->store('verifications', 'public') : null,
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => $verification,
            'message' => 'Solicitud de verificación enviada',
        ], 201);
    }

    public function getVerificationStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        $verification = IdentityVerification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();

        return response()->json([
            'data' => $verification,
        ]);
    }

    public function activityHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $days = $request->input('days', 30);

        $activities = UserActivity::forUser($user->id)
            ->recent($days)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($activities);
    }

    public function notificationPreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = NotificationPreference::where('user_id', $user->id)->get();

        return response()->json([
            'data' => $preferences,
        ]);
    }

    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.channel' => 'required|in:email,push,sms,in_app',
            'preferences.*.type' => 'required|in:leads,messages,orders,payments,marketing,security,products',
            'preferences.*.enabled' => 'required|boolean',
            'preferences.*.quiet_hours_start' => 'sometimes|nullable|time',
            'preferences.*.quiet_hours_end' => 'sometimes|nullable|time',
        ]);

        $user = $request->user();

        foreach ($validated['preferences'] as $pref) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'channel' => $pref['channel'],
                    'type' => $pref['type'],
                ],
                [
                    'enabled' => $pref['enabled'],
                    'quiet_hours_start' => $pref['quiet_hours_start'] ?? null,
                    'quiet_hours_end' => $pref['quiet_hours_end'] ?? null,
                ]
            );
        }

        return response()->json([
            'message' => 'Preferencias actualizadas',
        ]);
    }

    public function privacySettings(Request $request): JsonResponse
    {
        $user = $request->user();

        $settings = PrivacySetting::where('user_id', $user->id)->first();

        if (!$settings) {
            $settings = PrivacySetting::create([
                'user_id' => $user->id,
                ...PrivacySetting::defaults(),
            ]);
        }

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function updatePrivacySettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'show_email' => 'sometimes|boolean',
            'show_phone' => 'sometimes|boolean',
            'show_location' => 'sometimes|boolean',
            'show_business_info' => 'sometimes|boolean',
            'allow_messages_from_non_contacts' => 'sometimes|boolean',
            'allow_search_indexing' => 'sometimes|boolean',
            'show_profile_to' => 'sometimes|in:all,contacts,nobody',
            'show_activity_status' => 'sometimes|boolean',
        ]);

        $user = $request->user();

        $settings = PrivacySetting::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'data' => $settings,
            'message' => 'Configuración de privacidad actualizada',
        ]);
    }

    public function activeSessions(Request $request): JsonResponse
    {
        $user = $request->user();

        $sessions = Session::where('user_id', $user->id)
            ->active()
            ->orderByDesc('last_activity_at')
            ->get();

        return response()->json([
            'data' => $sessions,
        ]);
    }

    public function terminateSession(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();

        $session = Session::where('user_id', $user->id)
            ->where('id', $sessionId)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Sesión no encontrada'], 404);
        }

        $session->terminate();

        $this->logActivity($user->id, 'logout', "Sesión terminada: {$session->device_name}");

        return response()->json([
            'message' => 'Sesión terminada exitosamente',
        ]);
    }

    public function terminateAllSessions(Request $request): JsonResponse
    {
        $user = $request->user();

        Session::where('user_id', $user->id)
            ->where('id', '!=', $request->session()->getId())
            ->update(['is_active' => false]);

        $this->logActivity($user->id, 'logout', 'Todas las sesiones terminadas');

        return response()->json([
            'message' => 'Todas las sesiones han sido terminadas',
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'profile' => $user->toArray(),
            'activities' => UserActivity::forUser($user->id)->get()->toArray(),
            'privacy_settings' => PrivacySetting::where('user_id', $user->id)->first(),
            'notification_preferences' => NotificationPreference::where('user_id', $user->id)->get()->toArray(),
            'verification' => IdentityVerification::where('user_id', $user->id)->first(),
        ];

        $filename = "export_{$user->id}_" . now()->format('Y-m-d_His') . ".json";

        return response()->json([
            'data' => $data,
            'filename' => $filename,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    private function logActivity(int $userId, string $type, string $description): void
    {
        UserActivity::create([
            'user_id' => $userId,
            'type' => $type,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => substr(request()->userAgent(), 0, 500),
            'created_at' => now(),
        ]);
    }
}