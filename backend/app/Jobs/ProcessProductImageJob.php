<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ProcessProductImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public int $productId,
        public string $imagePath,
        public array $sizes = ['thumb' => 200, 'small' => 400, 'medium' => 800, 'large' => 1200]
    ) {}

    public function handle(): void
    {
        $image = Image::make(Storage::path($this->imagePath));

        foreach ($this->sizes as $sizeName => $maxWidth) {
            $resized = $image->resize($maxWidth, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            $pathInfo = pathinfo($this->imagePath);
            $newPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "_{$sizeName}." . $pathInfo['extension'];

            $resized->save(Storage::path($newPath), 85);
        }

        event(new \App\Events\ProductImageProcessed($this->productId, $this->imagePath));
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Image processing failed for product {$this->productId}: " . $exception->getMessage());
    }
}