<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Check for new or changed Microsoft Forms links on the CCB "Registro" buttons.
Schedule::command('ccb:watch-registration-link')
    ->everyFifteenMinutes()
    ->between('09:00', '14:00')
    ->timezone('America/Bogota')
    ->withoutOverlapping();

// Cleanup inactive users - every day at 2am
Schedule::job(new \App\Jobs\CleanupInactiveUsersJob())->dailyAt('02:00');

// Cleanup old notifications - every Monday at 6am
Schedule::command('notifications:cleanup --days=90')->weeklyOn(1, '06:00');

// Generate weekly reports - every Sunday at 8pm
Schedule::job(new \App\Jobs\GenerateReportJob(
    auth()->id() ?? 1,
    'sales',
    ['period' => 'last_week']
))->weeklyOn(0, '20:00');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
