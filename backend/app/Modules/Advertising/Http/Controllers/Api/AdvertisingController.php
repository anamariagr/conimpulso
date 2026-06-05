<?php

namespace App\Modules\Advertising\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Advertising\Models\AdCampaign;
use App\Modules\Advertising\Models\Ad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdvertisingController extends Controller
{
    public function campaignsIndex(Request $request): JsonResponse
    {
        $query = AdCampaign::with('shop')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $campaigns->items(),
        ]);
    }

    public function createCampaign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:banner,product,featured,search'],
            'budget' => ['required', 'numeric', 'min:1'],
            'daily_budget' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'targeting' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $campaign = AdCampaign::create([
            'user_id' => $request->user()->id,
            'shop_id' => $request->user()->shop?->id,
            'name' => $request->name,
            'type' => $request->type,
            'budget' => $request->budget,
            'daily_budget' => $request->daily_budget,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'targeting' => $request->targeting,
            'status' => 'active',
        ]);

        return $this->successResponse($campaign, 'Campaña creada', 201);
    }

    public function updateCampaign(Request $request, int $id): JsonResponse
    {
        $campaign = AdCampaign::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,paused,ended,draft'],
            'budget' => ['nullable', 'numeric', 'min:1'],
            'daily_budget' => ['nullable', 'numeric', 'min:0'],
            'end_date' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $campaign->update($validator->validated());

        return $this->successResponse($campaign, 'Campaña actualizada');
    }

    public function campaignStats(int $id): JsonResponse
    {
        $campaign = AdCampaign::with('ads')->findOrFail($id);

        $stats = [
            'impressions' => $campaign->impressions,
            'clicks' => $campaign->clicks,
            'conversions' => $campaign->conversions,
            'spent' => $campaign->spent,
            'ctr' => $campaign->impressions > 0 ? round(($campaign->clicks / $campaign->impressions) * 100, 2) : 0,
            'cpc' => $campaign->clicks > 0 ? round($campaign->spent / $campaign->clicks, 2) : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function createAd(Request $request, int $campaignId): JsonResponse
    {
        $campaign = AdCampaign::where('user_id', $request->user()->id)->findOrFail($campaignId);

        $validator = Validator::make($request->all(), [
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'type' => ['required', 'in:banner,product,sponsored'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'url'],
            'target_url' => ['nullable', 'string', 'url'],
            'bid_amount' => ['nullable', 'numeric', 'min:0.01'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $ad = Ad::create([
            'campaign_id' => $campaign->id,
            'product_id' => $request->product_id,
            'shop_id' => $request->user()->shop?->id,
            'type' => $request->type,
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'target_url' => $request->target_url,
            'bid_amount' => $request->bid_amount ?? 0.10,
            'status' => 'active',
        ]);

        return $this->successResponse($ad, 'Anuncio creado', 201);
    }

    public function myAds(Request $request): JsonResponse
    {
        $ads = Ad::with(['campaign', 'product', 'shop'])
            ->whereHas('campaign', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $ads->items(),
        ]);
    }

    public function featuredProducts(Request $request): JsonResponse
    {
        $ads = Ad::with(['product.shop', 'campaign'])
            ->active()
            ->where('type', 'product')
            ->orderBy('clicks', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ads,
        ]);
    }

    // Admin methods
    public function adminCampaigns(Request $request): JsonResponse
    {
        $query = AdCampaign::with(['user', 'shop'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $campaigns->items(),
        ]);
    }

    public function approveCampaign(int $id): JsonResponse
    {
        $campaign = AdCampaign::findOrFail($id);
        $campaign->update(['status' => 'active']);

        return $this->successResponse($campaign, 'Campaña aprobada');
    }

    public function pauseCampaign(int $id): JsonResponse
    {
        $campaign = AdCampaign::findOrFail($id);
        $campaign->update(['status' => 'paused']);

        return $this->successResponse($campaign, 'Campaña pausada');
    }
}