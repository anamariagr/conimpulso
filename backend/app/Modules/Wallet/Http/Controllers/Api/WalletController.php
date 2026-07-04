<?php

namespace App\Modules\Wallet\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\Wallet\Models\Wallet;
use App\Modules\Wallet\Models\WalletTransaction;
use App\Modules\Wallet\Models\WalletTopUp;
use App\Services\SiteSettings;
use App\Services\WhatsAppNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WalletController extends Controller
{
    protected const MANUAL_PROOF_METHODS = ['bre_b_llave', 'bre_b_qr'];

    public function index(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'currency' => 'USD']
        );

        return response()->json([
            'success' => true,
            'data' => $wallet,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (!$wallet) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $query = WalletTransaction::where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function topUpRequest(Request $request): JsonResponse
    {
        $requiresProof = in_array($request->payment_method, self::MANUAL_PROOF_METHODS, true);

        $validator = Validator::make($request->all(), [
            'amount' => ['required', 'numeric', 'min:1', 'max:1000000'],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_proof_url' => [$requiresProof ? 'required' : 'nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'currency' => 'USD']
        );

        $topUp = WalletTopUp::create([
            'user_id' => $request->user()->id,
            'wallet_id' => $wallet->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_reference' => $request->payment_reference,
            'payment_proof_url' => $request->payment_proof_url,
            'status' => 'pending',
        ]);

        $this->notifyAdminOfTopUp($topUp->load('user'));

        return $this->successResponse($topUp, 'Solicitud de recarga creada. Pendiente de verificación.', 201);
    }

    protected function coinRate(): float
    {
        return (float) SiteSettings::get('wallet_coin_value_cop', 3000);
    }

    protected function notifyAdminOfTopUp(WalletTopUp $topUp): void
    {
        $coins = round((float) $topUp->amount / $this->coinRate(), 2);

        $text = "💰 *Nueva solicitud de recarga* en ConImpulso\n\n"
            . "👤 Cliente: {$topUp->user->name} ({$topUp->user->email})\n"
            . '💵 Monto pagado: $' . number_format((float) $topUp->amount, 0, ',', '.') . " COP\n"
            . "🪙 Monedas a acreditar: {$coins}\n"
            . "💳 Método: {$topUp->payment_method}\n"
            . '📎 Comprobante: ' . ($topUp->payment_proof_url ? 'Sí, adjunto (revisar en el panel)' : 'No requerido');

        WhatsAppNotifier::send(SiteSettings::get('whatsapp_phone'), $text);
    }

    public function myTopUps(Request $request): JsonResponse
    {
        $topUps = WalletTopUp::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $topUps->items(),
        ]);
    }

    public function debit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (!$wallet) {
            return $this->errorResponse('Wallet not found', 404);
        }

        $amount = (float) $request->amount;

        if (!$wallet->canDebit($amount)) {
            return $this->errorResponse('Insufficient balance', 400);
        }

        $wallet->debit($amount, $request->description, $request->type ?? 'debit');

        return $this->successResponse($wallet, 'Débito realizado');
    }

    public function credit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'currency' => 'USD']
        );

        $wallet->credit(
            (float) $request->amount,
            $request->description,
            $request->type ?? 'credit'
        );

        return $this->successResponse($wallet, 'Crédito realizado');
    }

    public function stats(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        $stats = [
            'balance' => $wallet ? (float) $wallet->balance : 0,
            'total_deposits' => WalletTransaction::where('user_id', $request->user()->id)
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_withdrawals' => WalletTransaction::where('user_id', $request->user()->id)
                ->where('type', 'withdrawal')
                ->where('status', 'completed')
                ->sum('amount'),
            'total_spent' => WalletTransaction::where('user_id', $request->user()->id)
                ->whereIn('type', ['purchase', 'service', 'ad'])
                ->where('status', 'completed')
                ->sum('amount'),
            'pending_top_ups' => WalletTopUp::where('user_id', $request->user()->id)
                ->pending()
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    // Admin: Approve/reject top-up
    public function approveTopUp(Request $request, int $id): JsonResponse
    {
        $topUp = WalletTopUp::findOrFail($id);

        if ($topUp->status !== 'pending') {
            return $this->errorResponse('Top-up already processed', 422);
        }

        $validator = Validator::make($request->all(), [
            'action' => ['required', 'in:approve,reject'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        if ($request->action === 'approve') {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $topUp->user_id],
                ['balance' => 0, 'currency' => 'USD']
            );

            $coins = round((float) $topUp->amount / $this->coinRate(), 2);

            $wallet->credit($coins, 'Recarga aprobada: ' . $topUp->payment_reference, 'deposit');

            $topUp->update([
                'status' => 'approved',
                'wallet_id' => $wallet->id,
                'coins_credited' => $coins,
                'verified_at' => now(),
                'verified_by' => $request->user()->id,
            ]);

            return $this->successResponse($topUp, 'Recarga aprobada y monedas acreditadas');
        } else {
            $topUp->update([
                'status' => 'rejected',
                'verified_at' => now(),
                'verified_by' => $request->user()->id,
            ]);

            return $this->successResponse($topUp, 'Top-up rejected');
        }
    }

    public function pendingTopUps(): JsonResponse
    {
        $topUps = WalletTopUp::with('user')
            ->pending()
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $topUps->items(),
        ]);
    }

    public function adminListUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with(['wallet'])
            ->orderBy('name')
            ->paginate(20);

        $data = $users->getCollection()->map(function ($user) {
            return [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'balance' => $user->wallet ? (float) $user->wallet->balance : 0,
                'currency' => $user->wallet?->currency ?? 'USD',
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function adminCredit(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $user = User::findOrFail($userId);
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'currency' => 'USD']
        );

        $wallet->credit((float) $request->amount, $request->description, 'admin_credit');

        return $this->successResponse([
            'user_id' => $user->id,
            'name'    => $user->name,
            'balance' => (float) $wallet->fresh()->balance,
        ], 'Saldo acreditado correctamente');
    }

    public function adminDebit(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $user = User::findOrFail($userId);
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return $this->errorResponse('El usuario no tiene billetera', 404);
        }

        if (!$wallet->canDebit((float) $request->amount)) {
            return $this->errorResponse('Saldo insuficiente para realizar el débito', 400);
        }

        $wallet->debit((float) $request->amount, $request->description, 'admin_debit');

        return $this->successResponse([
            'user_id' => $user->id,
            'name'    => $user->name,
            'balance' => (float) $wallet->fresh()->balance,
        ], 'Saldo debitado correctamente');
    }
}