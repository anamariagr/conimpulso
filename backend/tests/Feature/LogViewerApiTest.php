<?php

namespace Tests\Feature;

use Tests\TestCase;

class LogViewerApiTest extends TestCase
{
    private string $logPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->logPath = storage_path('logs/testing-logviewer.log');
        config()->set('logging.channels.single.path', $this->logPath);

        file_put_contents($this->logPath, $this->fixture());
    }

    protected function tearDown(): void
    {
        if (file_exists($this->logPath)) {
            unlink($this->logPath);
        }

        parent::tearDown();
    }

    public function test_it_lists_entries_newest_first(): void
    {
        $response = $this->getJson('/api/admin/logs')->assertOk();

        $data = $response->json('data');

        $this->assertCount(4, $data);
        $this->assertSame('2026-09-18 18:27:03', $data[0]['timestamp']);
        $this->assertSame('2026-09-01 08:00:00', $data[3]['timestamp']);
        $this->assertSame(4, $response->json('meta.total'));
    }

    public function test_it_attaches_the_stack_trace_to_its_own_entry(): void
    {
        $entry = $this->getJson('/api/admin/logs')->json('data.1');

        $this->assertSame('ERROR', $entry['level']);
        $this->assertSame('SQLSTATE[42S02]: Base table not found', $entry['message']);
        $this->assertStringContainsString('#0 /var/www/html/app/Modules/Products', $entry['trace']);
        $this->assertStringContainsString('QueryException', $entry['context']);
    }

    public function test_it_filters_by_level(): void
    {
        $data = $this->getJson('/api/admin/logs?level[]=debug')->assertOk()->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('DEBUG', $data[0]['level']);
    }

    public function test_it_filters_by_date_range(): void
    {
        $data = $this->getJson('/api/admin/logs?from=2026-09-10&to=2026-09-15')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('2026-09-15 10:30:00', $data[0]['timestamp']);
    }

    public function test_it_searches_free_text_across_message_context_and_trace(): void
    {
        $byMessage = $this->getJson('/api/admin/logs?q=Base table')->json('data');
        $this->assertCount(1, $byMessage);

        $byExceptionClass = $this->getJson('/api/admin/logs?q=QueryException')->json('data');
        $this->assertCount(1, $byExceptionClass);

        $byFile = $this->getJson('/api/admin/logs?q=ProductController')->json('data');
        $this->assertCount(1, $byFile);

        $this->assertCount(0, $this->getJson('/api/admin/logs?q=noexisteestetexto')->json('data'));
    }

    public function test_it_combines_filters(): void
    {
        $data = $this->getJson('/api/admin/logs?level[]=error&from=2026-09-17')->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('2026-09-18 18:27:03', $data[0]['timestamp']);
    }

    public function test_it_paginates(): void
    {
        $response = $this->getJson('/api/admin/logs?per_page=2&page=2')->assertOk();

        $this->assertCount(2, $response->json('data'));
        $this->assertSame(2, $response->json('meta.current_page'));
        $this->assertSame(2, $response->json('meta.last_page'));
        $this->assertSame(4, $response->json('meta.total'));
    }

    public function test_it_exposes_the_available_levels_even_when_filtering(): void
    {
        $levels = $this->getJson('/api/admin/logs?level[]=debug')->json('meta.levels');

        $this->assertSame(['DEBUG', 'ERROR', 'WARNING'], $levels);
    }

    public function test_it_returns_an_empty_list_when_the_log_file_is_missing(): void
    {
        unlink($this->logPath);

        $response = $this->getJson('/api/admin/logs')->assertOk();

        $this->assertSame([], $response->json('data'));
        $this->assertFalse($response->json('meta.file_exists'));
    }

    public function test_it_rejects_a_malformed_date(): void
    {
        $this->getJson('/api/admin/logs?from=ayer')->assertStatus(422);
    }

    private function fixture(): string
    {
        return <<<'LOG'
        [2026-09-01 08:00:00] production.WARNING: Cache store unreachable, falling back to array
        [2026-09-15 10:30:00] production.DEBUG: Payload recibido {"shop_id":12}
        [2026-09-16 09:05:11] production.ERROR: SQLSTATE[42S02]: Base table not found {"exception":"[object] (Illuminate\\Database\\QueryException(code: 42S02): select * from products at /var/www/html/vendor/laravel/framework/src/Database/Connection.php:825)
        [stacktrace]
        #0 /var/www/html/app/Modules/Products/Http/Controllers/Api/ProductController.php(41): Illuminate\\Database\\Connection->run()
        #1 {main}
        "}
        [2026-09-18 18:27:03] production.ERROR: Undefined array key "price"

        LOG;
    }
}
