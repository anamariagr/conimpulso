<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 600;

    public function __construct(
        public int $userId,
        public string $reportType,
        public array $params = []
    ) {}

    public function handle(): void
    {
        $data = match ($this->reportType) {
            'sales' => $this->generateSalesReport(),
            'leads' => $this->generateLeadsReport(),
            'products' => $this->generateProductsReport(),
            'advertising' => $this->generateAdvertisingReport(),
            default => throw new \InvalidArgumentException("Unknown report type: {$this->reportType}"),
        };

        $filename = "reports/{$this->reportType}_{$this->userId}_{$this->getJobId()}.json";
        Storage::put($filename, json_encode($data));

        event(new \App\Events\ReportGenerated($this->userId, $this->reportType, $filename));
    }

    private function generateSalesReport(): array
    {
        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'period' => $this->params['period'] ?? 'last_30_days',
            'total_sales' => DB::table('orders')->where('created_at', '>=', now()->subDays(30))->count(),
            'total_revenue' => DB::table('orders')->where('created_at', '>=', now()->subDays(30))->sum('total'),
        ];
    }

    private function generateLeadsReport(): array
    {
        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'total_leads' => DB::table('leads')->count(),
            'converted' => DB::table('leads')->where('status', 'converted')->count(),
        ];
    }

    private function generateProductsReport(): array
    {
        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'total_products' => DB::table('products')->count(),
            'active' => DB::table('products')->where('status', 'active')->count(),
        ];
    }

    private function generateAdvertisingReport(): array
    {
        return [
            'generated_at' => Carbon::now()->toIso8601String(),
            'total_campaigns' => DB::table('ad_campaigns')->count(),
            'active_campaigns' => DB::table('ad_campaigns')->where('status', 'active')->count(),
        ];
    }
}