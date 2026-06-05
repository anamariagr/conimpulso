<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schedule;

class ScheduleJobsCommand extends Command
{
    protected $signature = 'jobs:schedule';

    protected $description = 'Register scheduled jobs';

    public function handle(): void
    {
        // Cleanup inactive users - every day at 2am
        $this->command('schedule:work');
    }
}