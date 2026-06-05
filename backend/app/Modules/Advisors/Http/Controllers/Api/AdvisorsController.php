<?php

namespace App\Modules\Advisors\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Advisors\Models\AdvisorProfile;
use App\Modules\Advisors\Models\AdvisorContract;
use App\Modules\Advisors\Models\AdvisorApplication;
use App\Modules\Advisors\Models\AdvisorLead;
use App\Modules\Advisors\Models\AdvisorCommission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdvisorsController extends Controller
{
    // Advisor Profiles
    public function profilesIndex(Request $request): JsonResponse
    {
        $query = AdvisorProfile::with('user')
            ->active()
            ->orderBy('level', 'desc');

        if ($request->has('level')) {
            $query->byLevel($request->level);
        }

        if ($request->has('category')) {
            $query->whereJsonContains('categories', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
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

    public function myProfile(Request $request): JsonResponse
    {
        $profile = AdvisorProfile::where('user_id', $request->user()->id)->with('user')->first();

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    public function createProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'skills' => ['nullable', 'array'],
            'categories' => ['nullable', 'array'],
            'references' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $existing = AdvisorProfile::where('user_id', $request->user()->id)->first();
        if ($existing) {
            return $this->errorResponse('Ya tienes un perfil de asesor', 422);
        }

        $profile = AdvisorProfile::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
        ]);

        return $this->successResponse($profile, 'Perfil de asesor creado', 201);
    }

    public function updateProfile(Request $request, int $id): JsonResponse
    {
        $profile = AdvisorProfile::findOrFail($id);

        if ($profile->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $validator = Validator::make($request->all(), [
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'skills' => ['nullable', 'array'],
            'categories' => ['nullable', 'array'],
            'references' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $profile->update($validator->validated());

        return $this->successResponse($profile, 'Perfil actualizado');
    }

    // Shop: Post advisor opportunity
    public function createOpportunity(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'products' => ['nullable', 'array'],
            'categories' => ['nullable', 'array'],
            'target_clients' => ['nullable', 'array'],
            'objectives' => ['nullable', 'array'],
            'terms' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $shop = $request->user()->shop;

        $opportunity = AdvisorContract::create([
            'shop_id' => $shop->id,
            'commission_rate' => $request->commission_rate,
            'products' => $request->products,
            'categories' => $request->categories,
            'target_clients' => $request->target_clients,
            'objectives' => $request->objectives,
            'terms' => $request->terms,
            'status' => 'active',
            'started_at' => now(),
        ]);

        return $this->successResponse($opportunity, 'Oportunidad publicada', 201);
    }

    public function opportunitiesIndex(Request $request): JsonResponse
    {
        $opportunities = AdvisorContract::with('shop')
            ->active()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $opportunities->items(),
        ]);
    }

    // Advisor: Apply to shop
    public function applyToShop(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $existing = AdvisorApplication::where('advisor_id', $request->user()->id)
            ->where('shop_id', $request->shop_id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return $this->errorResponse('Ya tienes una solicitud activa para esta tienda', 422);
        }

        $application = AdvisorApplication::create([
            'advisor_id' => $request->user()->id,
            'shop_id' => $request->shop_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return $this->successResponse($application, 'Solicitud enviada', 201);
    }

    public function myApplications(Request $request): JsonResponse
    {
        $applications = AdvisorApplication::with('shop')
            ->where('advisor_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    // Shop: View applications
    public function shopApplications(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;

        $applications = AdvisorApplication::with('advisor')
            ->where('shop_id', $shop->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function respondToApplication(Request $request, int $id): JsonResponse
    {
        $application = AdvisorApplication::findOrFail($id);
        $shop = $request->user()->shop;

        if ($application->shop_id !== $shop->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        if ($application->status !== 'pending') {
            return $this->errorResponse('La solicitud ya fue procesada', 422);
        }

        $validator = Validator::make($request->all(), [
            'action' => ['required', 'in:approve,reject'],
            'response' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        if ($request->action === 'approve') {
            $application->update([
                'status' => 'approved',
                'shop_response' => $request->response,
                'responded_at' => now(),
            ]);

            // Create contract
            AdvisorContract::create([
                'advisor_id' => $application->advisor_id,
                'shop_id' => $shop->id,
                'commission_rate' => $request->commission_rate ?? 10,
                'status' => 'active',
                'started_at' => now(),
            ]);

            return $this->successResponse($application, 'Solicitud aprobada');
        } else {
            $application->update([
                'status' => 'rejected',
                'shop_response' => $request->response,
                'responded_at' => now(),
            ]);

            return $this->successResponse($application, 'Solicitud rechazada');
        }
    }

    // Leads management
    public function myLeads(Request $request): JsonResponse
    {
        $leads = AdvisorLead::with(['shop', 'product'])
            ->where('advisor_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
        ]);
    }

    public function createLead(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shop_id' => ['required', 'integer', 'exists:shops,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_email' => ['required', 'email', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:50'],
            'client_company' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $lead = AdvisorLead::create([
            ...$validator->validated(),
            'advisor_id' => $request->user()->id,
        ]);

        return $this->successResponse($lead, 'Lead creado', 201);
    }

    public function updateLeadStatus(Request $request, int $id): JsonResponse
    {
        $lead = AdvisorLead::findOrFail($id);

        if ($lead->advisor_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:pending,contacted,qualified,converted,lost'],
            'sale_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $data = ['status' => $request->status];

        if ($request->status === 'converted') {
            $data['converted_at'] = now();
            $data['sale_amount'] = $request->sale_amount;

            // Calculate commission
            $contract = AdvisorContract::where('advisor_id', $request->user()->id)
                ->where('shop_id', $lead->shop_id)
                ->active()
                ->first();

            if ($contract && $request->sale_amount) {
                $commission = ($request->sale_amount * $contract->commission_rate) / 100;
                $data['commission_earned'] = $commission;

                AdvisorCommission::create([
                    'advisor_id' => $request->user()->id,
                    'shop_id' => $lead->shop_id,
                    'advisor_lead_id' => $lead->id,
                    'amount' => $commission,
                    'type' => 'sale',
                    'status' => 'pending',
                ]);
            }
        }

        $lead->update($data);

        return $this->successResponse($lead, 'Lead actualizado');
    }

    // Commissions
    public function myCommissions(Request $request): JsonResponse
    {
        $commissions = AdvisorCommission::with(['shop', 'lead'])
            ->where('advisor_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $commissions->items(),
        ]);
    }

    public function commissionStats(Request $request): JsonResponse
    {
        $stats = [
            'total_earned' => AdvisorCommission::where('advisor_id', $request->user()->id)->sum('amount'),
            'pending' => AdvisorCommission::where('advisor_id', $request->user()->id)->pending()->sum('amount'),
            'approved' => AdvisorCommission::where('advisor_id', $request->user()->id)->where('status', 'approved')->sum('amount'),
            'paid' => AdvisorCommission::where('advisor_id', $request->user()->id)->paid()->sum('amount'),
            'total_leads' => AdvisorLead::where('advisor_id', $request->user()->id)->count(),
            'converted_leads' => AdvisorLead::where('advisor_id', $request->user()->id)->converted()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}