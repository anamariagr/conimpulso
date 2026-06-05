<?php

namespace App\Jobs;

use App\Modules\Notifications\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public int $userId,
        public string $type,
        public string $title,
        public string $body,
        public array $data = []
    ) {}

    public function handle(): void
    {
        $notification = Notification::create([
            'user_id' => $this->userId,
            'type' => $this->type,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
            'status' => 'sent',
        ]);

        event(new \App\Events\NotificationCreated($notification));
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Notification job failed for user {$this->userId}: " . $exception->getMessage());
    }
}