<?php

namespace App\Modules\AI\Services;

class CategorySuggestionService
{
    public function suggestCategory(string $productName, string $description): array
    {
        $text = strtolower($productName . ' ' . $description);

        $categoryKeywords = [
            'electronics' => ['electronic', 'phone', 'laptop', 'computer', 'camera', 'tv', 'television', 'audio', 'headphone', 'speaker'],
            'clothing' => ['shirt', 'dress', 'pants', 'shoe', 'jacket', 'coat', 'hat', 'clothing', 'fashion'],
            'home' => ['furniture', 'chair', 'table', 'bed', 'lamp', 'decor', 'kitchen', 'home', 'garden'],
            'sports' => ['sport', 'fitness', 'gym', 'ball', 'racket', 'bike', 'bicycle', 'exercise'],
            'beauty' => ['cosmetic', 'makeup', 'skincare', 'cream', 'perfume', 'beauty', 'hair'],
            'books' => ['book', 'magazine', 'novel', 'educational', 'textbook'],
            'toys' => ['toy', 'game', 'puzzle', 'kid', 'child', 'baby'],
            'food' => ['food', 'snack', 'drink', 'organic', 'supplement'],
        ];

        $matches = [];

        foreach ($categoryKeywords as $category => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $score++;
                }
            }
            if ($score > 0) {
                $matches[$category] = $score;
            }
        }

        arsort($matches);

        return [
            'suggested_category' => array_key_first($matches),
            'all_matches' => $matches,
            'confidence' => count($matches) > 0 ? min((end($matches) / 3), 0.9) : 0,
        ];
    }
}