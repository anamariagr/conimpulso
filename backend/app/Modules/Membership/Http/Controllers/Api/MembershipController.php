<?php

namespace App\Modules\Membership\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Membership\Models\MembershipPlan;
use App\Modules\Membership\Models\MembershipSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function plans(): JsonResponse
    {
        $plans = MembershipPlan::active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    public function mySubscription(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = MembershipSubscription::with('plan')
            ->where('user_id', $user->id)
            ->active()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subscription,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:membership_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'auto_renew' => 'boolean',
        ]);

        $user = $request->user();
        $plan = MembershipPlan::findOrFail($validated['plan_id']);

        // Check if already has active subscription
        $existing = MembershipSubscription::where('user_id', $user->id)
            ->active()
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already has an active subscription',
            ], 400);
        }

        $price = $validated['billing_cycle'] === 'yearly'
            ? $plan->price_yearly
            : $plan->price_monthly;

        $subscription = MembershipSubscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => MembershipSubscription::STATUS_ACTIVE,
            'billing_cycle' => $validated['billing_cycle'],
            'price_paid' => $price,
            'currency' => $plan->currency,
            'started_at' => now(),
            'expires_at' => $validated['billing_cycle'] === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
            'auto_renew' => $validated['auto_renew'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $subscription,
            'message' => 'Subscription activated successfully',
        ]);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = MembershipSubscription::where('user_id', $user->id)
            ->active()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found',
            ], 404);
        }

        $subscription->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully',
        ]);
    }

    public function benefits(): JsonResponse
    {
        $benefits = [
            'basic' => [
                'product_limit' => 50,
                'categories_limit' => 5,
                'banner_featured' => false,
                'priority_support' => false,
                'analytics_basic' => true,
                'api_access' => false,
                'custom_url' => false,
            ],
            'professional' => [
                'product_limit' => 500,
                'categories_limit' => 20,
                'banner_featured' => true,
                'priority_support' => true,
                'analytics_basic' => true,
                'api_access' => true,
                'custom_url' => false,
            ],
            'enterprise' => [
                'product_limit' => -1, // unlimited
                'categories_limit' => -1,
                'banner_featured' => true,
                'priority_support' => true,
                'analytics_basic' => true,
                'analytics_advanced' => true,
                'api_access' => true,
                'custom_url' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $benefits,
        ]);
    }
}