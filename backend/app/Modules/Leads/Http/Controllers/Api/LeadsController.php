<?php

namespace App\Modules\Leads\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Leads\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::with(['user', 'shop', 'product', 'service', 'assignee']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $perPage = min($request->get('per_page', 20), 100);
        $leads = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ],
        ]);
    }

    public function myLeads(Request $request): JsonResponse
    {
        $leads = Lead::with(['shop', 'product', 'service'])
            ->where('assigned_to', $request->user()->id)
            ->orderBy('follow_up_date', 'asc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'shop_id' => ['nullable', 'integer', 'exists:shops,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'source' => ['nullable', 'in:website,shop,product,service,ad,referral,other'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $lead = Lead::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
            'source' => $request->source ?? 'website',
        ]);

        return $this->successResponse($lead, 'Lead creado', 201);
    }

    public function show(int $id): JsonResponse
    {
        $lead = Lead::with(['user', 'shop', 'product', 'service', 'assignee'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $lead,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'in:pending,contacted,qualified,converted,lost'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
            'follow_up_date' => ['nullable', 'date', 'after:today'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $lead->update($validator->validated());

        return $this->successResponse($lead, 'Lead actualizado');
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $lead->update(['assigned_to' => $request->assigned_to]);

        return $this->successResponse($lead, 'Lead asignado');
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'notes' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $currentNotes = $lead->notes ?? '';
        $newNote = "\n[" . now()->toDateTimeString() . "] " . $request->notes;
        $lead->update(['notes' => $currentNotes . $newNote]);

        return $this->successResponse($lead, 'Nota agregada');
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Lead::count(),
            'pending' => Lead::pending()->count(),
            'contacted' => Lead::contacted()->count(),
            'qualified' => Lead::qualified()->count(),
            'converted' => Lead::converted()->count(),
            'by_source' => Lead::selectRaw('source, count(*) as count')->groupBy('source')->pluck('count', 'source'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}