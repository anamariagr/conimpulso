<?php

namespace App\Modules\Blog\Services;

use App\Modules\Blog\Models\BlogPost;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BlogPostGeneratorService
{
    private string $apiKey;
    private string $model = 'gemini-3.5-flash';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', '');
    }

    public function generateForProduct(array $productData, array $story): BlogPost
    {
        $rawText = $this->storyToText('product', $productData, $story);
        $enhanced = $this->enhanceWithAI('product', $productData, $story, $rawText);

        return BlogPost::create([
            'title'        => $enhanced['title'],
            'slug'         => BlogPost::generateUniqueSlug($enhanced['title']),
            'excerpt'      => $enhanced['excerpt'],
            'content'      => $enhanced['content'],
            'cover_image'  => $productData['cover_image'] ?? null,
            'type'         => 'product',
            'related_id'   => $productData['id'],
            'related_type' => 'product',
            'status'       => 'published',
            'published_at' => now(),
        ]);
    }

    public function generateForShop(array $shopData, array $story): BlogPost
    {
        $rawText = $this->storyToText('shop', $shopData, $story);
        $enhanced = $this->enhanceWithAI('shop', $shopData, $story, $rawText);

        return BlogPost::create([
            'title'        => $enhanced['title'],
            'slug'         => BlogPost::generateUniqueSlug($enhanced['title']),
            'excerpt'      => $enhanced['excerpt'],
            'content'      => $enhanced['content'],
            'cover_image'  => $shopData['cover_image'] ?? null,
            'type'         => 'shop',
            'related_id'   => $shopData['id'],
            'related_type' => 'shop',
            'status'       => 'published',
            'published_at' => now(),
        ]);
    }

    private function storyToText(string $type, array $data, array $story): string
    {
        if ($type === 'product') {
            return implode(' ', array_filter([
                isset($story['materials'])   ? "Materiales: {$story['materials']}." : null,
                isset($story['process'])     ? "Proceso de elaboración: {$story['process']}." : null,
                isset($story['time'])        ? "Tiempo de fabricación: {$story['time']}." : null,
                isset($story['ideal_for'])   ? "Ideal para: {$story['ideal_for']}." : null,
                isset($story['unique'])      ? "Lo que lo hace único: {$story['unique']}." : null,
            ]));
        }

        return implode(' ', array_filter([
            isset($story['what_we_do'])      ? "Qué hacemos: {$story['what_we_do']}." : null,
            isset($story['founded_year'])    ? "Año de inicio: {$story['founded_year']}." : null,
            isset($story['why_started'])     ? "Por qué empezamos: {$story['why_started']}." : null,
            isset($story['location'])        ? "Ubicación: {$story['location']}." : null,
            isset($story['differentiator'])  ? "Nos diferenciamos porque: {$story['differentiator']}." : null,
        ]));
    }

    private function enhanceWithAI(string $type, array $data, array $story, string $rawText): array
    {
        $isProduct = $type === 'product';
        $name      = $data['name'] ?? 'Producto';
        $price     = $isProduct && isset($data['price']) ? '$ ' . number_format((float)$data['price'], 0, ',', '.') : null;
        $city      = $data['city'] ?? null;
        $stock     = $isProduct && isset($data['stock']) ? (int)$data['stock'] : null;

        $contextLines = array_filter([
            "Nombre: {$name}",
            $price  ? "Precio: {$price}" : null,
            $city   ? "Ciudad: {$city}" : null,
            $stock !== null ? "Unidades disponibles: {$stock}" : null,
            "Historia del vendedor: {$rawText}",
        ]);

        $typeLabel = $isProduct ? 'producto artesanal' : 'tienda / emprendimiento artesanal';

        $prompt = <<<PROMPT
Eres el editor de contenido de ConImpulso, un marketplace latinoamericano que conecta directamente a artesanos y emprendedores con compradores, sin intermediarios.

Tu tarea: escribir un post de blog atractivo para un {$typeLabel} nuevo en la plataforma.

INFORMACIÓN DEL VENDEDOR:
{$this->formatLines($contextLines)}

INSTRUCCIONES:
- Escribe en español, tono cercano y cálido
- Resalta que es hecho a mano / artesanal
- Destaca que se compra directo al creador, sin intermediarios
- Apoya el emprendimiento local latinoamericano
- 2 párrafos cortos (máximo 80 palabras cada uno)
- No exageres ni uses superlativos vacíos
- Siempre termina con una frase de llamada a la acción

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
{
  "title": "Título atractivo del post (máximo 10 palabras)",
  "excerpt": "Una sola oración gancho para quien lea el titular (máximo 20 palabras)",
  "content": "Párrafo 1 completo.\n\nPárrafo 2 completo.\n\nFrase de llamada a la acción."
}
PROMPT;

        try {
            if (empty($this->apiKey)) {
                return $this->fallback($name, $rawText, $isProduct);
            }

            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";

            $response = Http::timeout(20)
                ->withHeaders([
                    'Content-Type'    => 'application/json',
                    'x-goog-api-key'  => $this->apiKey,
                ])
                ->post($url, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => 512,
                        'temperature'     => 0.7,
                    ],
                ]);

            if ($response->successful()) {
                $text = $response->json('candidates.0.content.parts.0.text', '');
                // Gemini sometimes wraps JSON in ```json ... ```
                $text = preg_replace('/^```(?:json)?\s*/i', '', trim($text));
                $text = preg_replace('/\s*```$/', '', $text);
                $decoded = json_decode($text, true);
                if ($decoded && isset($decoded['title'], $decoded['excerpt'], $decoded['content'])) {
                    return $decoded;
                }
            }

            Log::warning('Blog AI (Gemini): unexpected response', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Throwable $e) {
            Log::error('Blog AI (Gemini): API call failed', ['error' => $e->getMessage()]);
        }

        return $this->fallback($name, $rawText, $isProduct);
    }

    private function fallback(string $name, string $rawText, bool $isProduct): array
    {
        $type = $isProduct ? 'producto' : 'emprendimiento';
        return [
            'title'   => $isProduct ? "Conoce: {$name}" : "Nuevo emprendimiento: {$name}",
            'excerpt' => "Descubre este {$type} artesanal disponible ahora en ConImpulso.",
            'content' => "{$rawText}\n\nEncuéntralo ahora en ConImpulso y apoya el emprendimiento local.",
        ];
    }

    private function formatLines(array $lines): string
    {
        return implode("\n", array_map(fn($l) => "- {$l}", $lines));
    }
}
