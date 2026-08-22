<?php

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => 'pending',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Complete onboarding: assign role(s) based on the selected goal.
     *
     * goal options:
     *   sell_products -> vendor
     *   sell_services -> advisor
     *   both          -> vendor + advisor
     *   buy           -> client
     */
    public function completeOnboarding(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'goal' => ['required', 'string', 'in:sell_products,sell_services,both,buy'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $rolesByGoal = [
            'sell_products' => ['vendor'],
            'sell_services' => ['advisor'],
            'both'          => ['vendor', 'advisor'],
            'buy'           => ['client'],
        ];

        $roles = $rolesByGoal[$request->goal];

        $user = $request->user();
        $user->assignRole($roles);

        if ($user->status === 'pending') {
            $user->update(['status' => 'active']);
        }

        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Onboarding completed successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'status' => $user->status,
                    'roles' => $user->getRoleNames(),
                ],
            ],
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $key = 'login_attempt:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 900);
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended',
            ], 403);
        }

        RateLimiter::clear($key);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'document_id' => $user->document_id,
                    'address' => $user->address,
                    'avatar' => $user->avatar,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'roles' => $user->getRoleNames(),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'permissions');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'document_id' => $user->document_id,
                    'address' => $user->address,
                    'avatar' => $user->avatar,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'messaging_enabled' => (bool) $user->messaging_enabled,
                    'messaging_disabled_reason' => $user->messaging_disabled_reason,
                    'messaging_disabled_at' => $user->messaging_disabled_at,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getDirectPermissions()->pluck('name'),
                    'created_at' => $user->created_at,
                ],
            ],
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified',
            ], 400);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified',
            ], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent',
        ]);
    }

    public function availableForMessaging(Request $request): JsonResponse
    {
        $search = $request->get('search');

        $query = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where('messaging_enabled', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')
            ->limit(50)
            ->get(['id', 'name', 'email', 'avatar', 'status', 'messaging_enabled']);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function googleAuth(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'credential' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Token requerido'], 422);
        }

        // Verify token with Google
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $request->credential,
        ]);

        if (!$response->successful()) {
            return response()->json(['success' => false, 'message' => 'Token de Google inválido'], 401);
        }

        $googleUser = $response->json();

        // Validate audience matches our client ID
        $clientId = config('services.google.client_id');
        if ($clientId && $googleUser['aud'] !== $clientId) {
            return response()->json(['success' => false, 'message' => 'Token no autorizado'], 401);
        }

        $email = $googleUser['email'] ?? null;
        $googleId = $googleUser['sub'] ?? null;

        if (!$email || !$googleId) {
            return response()->json(['success' => false, 'message' => 'No se pudo obtener el email de Google'], 422);
        }

        // Find or create user
        $isNew = false;
        $user = User::where('google_id', $googleId)->orWhere('email', $email)->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update(['google_id' => $googleId]);
            }
            if ($user->status === 'suspended') {
                return response()->json(['success' => false, 'message' => 'Cuenta suspendida'], 403);
            }
        } else {
            $isNew = true;
            $user = User::create([
                'name'              => $googleUser['name'] ?? $email,
                'email'             => $email,
                'google_id'         => $googleId,
                'avatar'            => $googleUser['picture'] ?? null,
                'email_verified_at' => now(),
                'password'          => Hash::make(Str::random(32)),
                'status'            => 'active',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login con Google exitoso',
            'data' => [
                'user' => [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'avatar'            => $user->avatar,
                    'status'            => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'roles'             => $user->getRoleNames(),
                ],
                'token'      => $token,
                'token_type' => 'Bearer',
                'is_new'     => $isNew,
            ],
        ]);
    }
}