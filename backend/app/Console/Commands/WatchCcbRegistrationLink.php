<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class WatchCcbRegistrationLink extends Command
{
    protected $signature = 'ccb:watch-registration-link';

    protected $description = 'Detecta cambios en enlaces de formularios de Registro en la página de ferias CCB';

    private const PAGE_URL = 'https://www.ccb.org.co/es/servicios/haz-crecer-tu-empresa/incrementa-tus-ventas/ferias-comerciales';

    private const CACHE_KEY = 'ccb.registration_links.table_registro.v2';

    public function handle(): int
    {
        try {
            $links = $this->fetchRegistrationLinks();
        } catch (\Throwable $exception) {
            report($exception);
            $this->error('No se pudo consultar la página de la CCB. Se conserva el último estado guardado.');

            return self::FAILURE;
        }

        $previous = Cache::get(self::CACHE_KEY);

        // First successful scan establishes a baseline and never sends a false alert.
        if (! is_array($previous)) {
            Cache::forever(self::CACHE_KEY, $links);
            $this->info('Estado inicial guardado: '.count($links).' enlace(s) de Registro.');

            return self::SUCCESS;
        }

        if ($previous === $links) {
            $this->info('Sin cambios en el botón Registro.');

            return self::SUCCESS;
        }

        $this->sendChangeEmail($previous, $links);
        Cache::forever(self::CACHE_KEY, $links);
        $this->info('Cambio detectado y correo enviado.');

        return self::SUCCESS;
    }

    /** @return array<string, array{label: string, url: string}> */
    private function fetchRegistrationLinks(): array
    {
        $response = Http::timeout(25)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; CCBRegistrationWatcher/1.0)'])
            ->get(self::PAGE_URL)
            ->throw();

        if (! class_exists(\DOMDocument::class)) {
            throw new RuntimeException('La extensión PHP DOM/XML es necesaria para analizar la página.');
        }

        $document = new \DOMDocument();
        $previousErrors = libxml_use_internal_errors(true);
        $loaded = $document->loadHTML($response->body());
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrors);

        if (! $loaded) {
            throw new RuntimeException('No se pudo analizar el HTML de la página de la CCB.');
        }

        $links = [];
        $xpath = new \DOMXPath($document);
        $anchors = $xpath->query('//td//a');

        foreach ($anchors ?: [] as $anchor) {
            $label = trim(preg_replace('/\s+/u', ' ', $anchor->textContent) ?? '');
            $href = trim($anchor->getAttribute('href'));

            if (mb_strtolower($label) !== 'registro' || $href === '') {
                continue;
            }

            $url = $this->absoluteUrl($href);
            if (! $this->isHttpUrl($url)) {
                continue;
            }

            $links[$url] = ['label' => $label, 'url' => $url];
        }

        ksort($links);

        return $links;
    }

    private function isHttpUrl(string $url): bool
    {
        return in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true)
            && is_string(parse_url($url, PHP_URL_HOST));
    }

    private function absoluteUrl(string $url): string
    {
        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }

        if (parse_url($url, PHP_URL_SCHEME)) {
            return $url;
        }

        return 'https://www.ccb.org.co/'.ltrim($url, '/');
    }

    /** @param array<string, array{label: string, url: string}> $previous
     *  @param array<string, array{label: string, url: string}> $current
     */
    private function sendChangeEmail(array $previous, array $current): void
    {
        $added = array_diff_key($current, $previous);
        $removed = array_diff_key($previous, $current);

        $lines = [
            'Se detectó un cambio en el botón Registro de las ferias comerciales de la CCB.',
            '',
            'Enlaces nuevos:',
        ];

        foreach ($added as $link) {
            $lines[] = $link['url'];
        }

        if ($added === []) {
            $lines[] = 'Ninguno';
        }

        if ($removed !== []) {
            $lines[] = '';
            $lines[] = 'Enlaces que ya no aparecen:';
            foreach ($removed as $link) {
                $lines[] = $link['url'];
            }
        }

        $lines[] = '';
        $lines[] = 'Revisa la página de la CCB: '.self::PAGE_URL;

        $recipient = config('services.ccb_registration_alert.email');
        if (! is_string($recipient) || $recipient === '') {
            throw new RuntimeException('Configura CCB_REGISTRATION_ALERT_EMAIL para activar los avisos.');
        }

        Mail::raw(implode("\n", $lines), function ($message) use ($recipient): void {
            $message->to($recipient)
                ->subject('Cambio en el enlace de postulación a ferias CCB');
        });
    }
}
