<?php

namespace App\Modules\B2B\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\B2B\Models\BusinessProfile;
use App\Modules\B2B\Models\B2BConnection;
use App\Modules\B2B\Models\SupplierRequest;
use App\Modules\B2B\Models\SupplierQuote;
use App\Modules\B2B\Models\Negotiation;
use App\Modules\B2B\Models\NegotiationMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class B2BController extends Controller
{
    // Business Profiles
    public function profilesIndex(Request $request): JsonResponse
    {
        $query = BusinessProfile::with('user')
            ->verified()
            ->active();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('company_name', 'like', "%{$search}%");
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('certification')) {
            $query->whereJsonContains('certifications', $request->certification);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $profiles = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $profiles->items(),
            'meta' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'per_page' => $profiles->perPage(),
                'total' => $profiles->total(),
            ],
        ]);
    }

    public function myBusinessProfile(Request $request): JsonResponse
    {
        $profile = BusinessProfile::where('user_id', $request->user()->id)->first();

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    public function createBusinessProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'nit' => ['required', 'string', 'max:20', 'unique:business_profiles,nit'],
            'description' => ['nullable', 'string'],
            'production_capacity' => ['nullable', 'string'],
            'certifications' => ['nullable', 'array'],
            'business_type' => ['nullable', 'in:manufacturer,distributor,importer,exporter,service_provider'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $existing = BusinessProfile::where('user_id', $request->user()->id)->first();
        if ($existing) {
            return $this->errorResponse('Ya tienes un perfil empresarial', 422);
        }

        $profile = BusinessProfile::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
            'verification_status' => 'pending',
        ]);

        return $this->successResponse($profile, 'Perfil empresarial creado', 201);
    }

    public function updateBusinessProfile(Request $request, int $id): JsonResponse
    {
        $profile = BusinessProfile::findOrFail($id);

        if ($profile->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'nit' => ['sometimes', 'required', 'string', 'max:20', 'unique:business_profiles,nit,' . $id],
            'description' => ['nullable', 'string'],
            'production_capacity' => ['nullable', 'string'],
            'certifications' => ['nullable', 'array'],
            'business_type' => ['nullable', 'in:manufacturer,distributor,importer,exporter,service_provider'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $profile->update($validator->validated());

        return $this->successResponse($profile, 'Perfil actualizado');
    }

    // B2B Connections
    public function connectionsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = B2BConnection::with(['initiator', 'target'])
            ->where(function ($q) use ($user) {
                $q->where('initiator_id', $user->id)
                    ->orWhere('target_id', $user->id);
            })
            ->where('status', 'accepted');

        $connections = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $connections->items(),
        ]);
    }

    public function pendingConnections(Request $request): JsonResponse
    {
        $user = $request->user();

        // Pending received
        $received = B2BConnection::with('initiator')
            ->where('target_id', $user->id)
            ->pending()
            ->get();

        // Pending sent
        $sent = B2BConnection::with('target')
            ->where('initiator_id', $user->id)
            ->pending()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'received' => $received,
                'sent' => $sent,
            ],
        ]);
    }

    public function sendConnectionRequest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'target_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['nullable', 'in:connection,supplier,distributor,partnership'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $targetId = $request->target_id;

        if ($targetId === $request->user()->id) {
            return $this->errorResponse('No puedes enviarte una solicitud a ti mismo', 422);
        }

        // Check existing connection
        $existing = B2BConnection::where(function ($q) use ($request, $targetId) {
            $q->where('initiator_id', $request->user()->id)->where('target_id', $targetId);
        })->orWhere(function ($q) use ($request, $targetId) {
            $q->where('initiator_id', $targetId)->where('target_id', $request->user()->id);
        })->first();

        if ($existing) {
            return $this->errorResponse('Ya existe una conexión o solicitud', 422);
        }

        $connection = B2BConnection::create([
            'initiator_id' => $request->user()->id,
            'target_id' => $targetId,
            'type' => $request->type ?? 'connection',
            'message' => $request->message,
            'status' => 'pending',
        ]);

        $connection->load('target');

        return $this->successResponse($connection, 'Solicitud enviada', 201);
    }

    public function respondToConnection(Request $request, int $id): JsonResponse
    {
        $connection = B2BConnection::findOrFail($id);

        if ($connection->target_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        if ($connection->status !== 'pending') {
            return $this->errorResponse('La solicitud ya fue procesada', 422);
        }

        $validator = Validator::make($request->all(), [
            'action' => ['required', 'in:accept,reject'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        if ($request->action === 'accept') {
            $connection->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);
            $message = 'Conexión aceptada';
        } else {
            $connection->update([
                'status' => 'rejected',
                'rejected_at' => now(),
            ]);
            $message = 'Conexión rechazada';
        }

        return $this->successResponse($connection, $message);
    }

    // Supplier Requests
    public function supplierRequestsIndex(Request $request): JsonResponse
    {
        $query = SupplierRequest::with('user')
            ->open()
            ->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $perPage = min($request->get('per_page', 20), 100);
        $requests = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
        ]);
    }

    public function createSupplierRequest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'requirements' => ['nullable', 'array'],
            'attachments' => ['nullable', 'array'],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date', 'after:today'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $data['user_id'] = $request->user()->id;

        $supplierRequest = SupplierRequest::create($data);

        return $this->successResponse($supplierRequest, 'Solicitud creada', 201);
    }

    public function submitQuote(Request $request, int $requestId): JsonResponse
    {
        $supplierRequest = SupplierRequest::findOrFail($requestId);

        if ($supplierRequest->status !== 'open') {
            return $this->errorResponse('La solicitud no está abierta', 422);
        }

        $validator = Validator::make($request->all(), [
            'proposal' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:1'],
            'attachments' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        // Check if user already quoted
        $existingQuote = SupplierQuote::where('request_id', $requestId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingQuote) {
            return $this->errorResponse('Ya enviaste una cotización', 422);
        }

        $quote = SupplierQuote::create([
            ...$validator->validated(),
            'request_id' => $requestId,
            'user_id' => $request->user()->id,
        ]);

        return $this->successResponse($quote, 'Cotización enviada', 201);
    }

    // Negotiations
    public function negotiationsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $negotiations = Negotiation::with(['initiator', 'target', 'relatedProduct'])
            ->where(function ($q) use ($user) {
                $q->where('initiator_id', $user->id)
                    ->orWhere('target_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $negotiations->items(),
        ]);
    }

    public function createNegotiation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'target_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'related_product_id' => ['nullable', 'integer'],
            'initial_offer' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $negotiation = Negotiation::create([
            'initiator_id' => $request->user()->id,
            'target_id' => $request->target_id,
            'title' => $request->title,
            'description' => $request->description,
            'related_product_id' => $request->related_product_id,
            'initial_offer' => $request->initial_offer,
            'status' => 'active',
        ]);

        $negotiation->load('target');

        return $this->successResponse($negotiation, 'Negociación iniciada', 201);
    }

    public function negotiationMessages(int $negotiationId): JsonResponse
    {
        $messages = NegotiationMessage::where('negotiation_id', $negotiationId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark as read
        NegotiationMessage::where('negotiation_id', $negotiationId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function sendNegotiationMessage(Request $request, int $negotiationId): JsonResponse
    {
        $negotiation = Negotiation::findOrFail($negotiationId);

        if (!in_array($request->user()->id, [$negotiation->initiator_id, $negotiation->target_id])) {
            return $this->errorResponse('No autorizado', 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array'],
            'offer_data' => ['nullable', 'array'],
            'type' => ['nullable', 'in:message,offer,counter_offer,document'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $message = NegotiationMessage::create([
            'negotiation_id' => $negotiationId,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'attachments' => $request->attachments,
            'offer_data' => $request->offer_data,
            'type' => $request->type ?? 'message',
        ]);

        $message->load('user');

        return $this->successResponse($message, 'Mensaje enviado', 201);
    }

    public function agreeNegotiation(int $negotiationId): JsonResponse
    {
        $negotiation = Negotiation::findOrFail($negotiationId);

        // Only target can agree
        if ($negotiation->target_id !== request()->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $negotiation->update([
            'status' => 'agreed',
            'agreed_at' => now(),
            'final_terms' => $negotiation->initial_offer,
        ]);

        return $this->successResponse($negotiation, 'Acuerdo aceptado');
    }
}