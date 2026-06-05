<?php

namespace App\Modules\AI\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\AI\Models\ContentFlag;
use App\Modules\AI\Models\UserRiskScore;
use App\Modules\AI\Models\SpamDetection;
use App\Modules\AI\Models\ContentModerationLog;
use App\Modules\AI\Services\AIContentModerationService;
use App\Modules\AI\Services\ProductRecommendationService;
use App\Modules\AI\Services\CategorySuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function __construct(
        private AIContentModerationService $moderationService,
        private ProductRecommendationService $recommendationService,
        private CategorySuggestionService $categoryService
    ) {}

    public function moderateContent(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:10000',
            'type' => 'nullable|string|in:general,product,message,review,comment',
        ]);

        $result = $this->moderationService->moderateContent(
            $request->content,
            $request->type ?? 'general'
        );

        // Log moderation for audit
        if ($result['action'] !== 'approve') {
            ContentModerationLog::create([
                'content_type' => $request->type ?? 'general',
                'content_id' => null,
                'input_data' => ['content' => $request->content],
                'ai_response' => $result,
                'confidence' => $result['confidence'],
                'action_taken' => $result['action'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function analyzeUser(Request $request): JsonResponse
    {
        $request->validate([
            'events' => 'required|array',
        ]);

        $result = $this->moderationService->analyzeUserBehavior($request->events);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function similarProducts(int $productId): JsonResponse
    {
        $products = $this->recommendationService->getSimilarProducts($productId);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function relatedProducts(int $productId): JsonResponse
    {
        $products = $this->recommendationService->getRelatedProducts($productId);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function trendingProducts(): JsonResponse
    {
        $products = $this->recommendationService->getTrendingProducts();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function personalizedRecommendations(Request $request): JsonResponse
    {
        $products = $this->recommendationService->getPersonalizedRecommendations(
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function suggestCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
        ]);

        $result = $this->categoryService->suggestCategory(
            $request->name,
            $request->description ?? ''
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function publicSuggestCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
        ]);

        $result = $this->categoryService->suggestCategory(
            $request->name,
            $request->description ?? ''
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    // Admin methods
    public function flaggedContent(Request $request): JsonResponse
    {
        $query = ContentFlag::with(['user', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $flags = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $flags->items(),
        ]);
    }

    public function userRiskScores(Request $request): JsonResponse
    {
        $query = UserRiskScore::with('user')
            ->orderBy('risk_level', 'desc');

        if ($request->has('level')) {
            $query->where('risk_level', $request->level);
        }

        $scores = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $scores->items(),
        ]);
    }

    public function reviewFlaggedContent(Request $request, int $id): JsonResponse
    {
        $flag = ContentFlag::findOrFail($id);

        $request->validate([
            'action' => 'required|in:cleared,confirmed',
            'notes' => 'nullable|string|max:1000',
        ]);

        $flag->update([
            'status' => $request->action === 'cleared' ? 'cleared' : 'flagged',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $request->notes,
        ]);

        return $this->successResponse($flag, 'Content reviewed');
    }
}