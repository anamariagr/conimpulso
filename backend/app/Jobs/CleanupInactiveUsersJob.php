<?php

namespace App\Jobs;

use App\Modules\Auth\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CleanupInactiveUsersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $threshold = now()->subMonths(6);

        $users = User::where('last_activity_at', '<', $threshold)
            ->where('is_active', true)
            ->cursor();

        foreach ($users as $user) {
            $user->update(['is_active' => false]);

            \App\Services\CacheInvalidationService::new()->invalidateUser($user->id);
        }
    }
}