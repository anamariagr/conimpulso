<?php

namespace App\Modules\Admin\Support;

/**
 * Lee y parsea un archivo de log de Laravel (formato por defecto de Monolog).
 *
 * Una entrada arranca con una cabecera:
 *
 *     [2026-09-18 18:27:03] production.ERROR: mensaje {"context":"json"}
 *
 * y todas las líneas siguientes (el stack trace) pertenecen a esa misma entrada
 * hasta que aparece la próxima cabecera.
 */
class LaravelLogReader
{
    /**
     * Tope de lectura. El log vive dentro del contenedor y hoy pesa ~300 KB,
     * pero si algún día se dispara no queremos cargarlo entero en memoria.
     */
    public const MAX_BYTES = 5 * 1024 * 1024;

    private const HEADER = '/^\[(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:[+-]\d{2}:\d{2})?\] ([\w\-]+)\.(\w+): (.*)$/';

    public function __construct(private readonly string $path) {}

    public function exists(): bool
    {
        return is_readable($this->path);
    }

    public function sizeInBytes(): int
    {
        return $this->exists() ? (int) filesize($this->path) : 0;
    }

    /**
     * ¿Se leyó el archivo completo, o se cortó por el tope?
     */
    public function isTruncated(): bool
    {
        return $this->sizeInBytes() > self::MAX_BYTES;
    }

    /**
     * Devuelve las entradas del log, de la más reciente a la más antigua.
     *
     * @return array<int, array{id:string, timestamp:string, date:string, channel:string, level:string, message:string, context:string, trace:string}>
     */
    public function entries(): array
    {
        if (! $this->exists()) {
            return [];
        }

        $entries = [];
        $current = null;

        foreach ($this->lines() as $line) {
            if (preg_match(self::HEADER, $line, $m)) {
                if ($current !== null) {
                    $entries[] = $this->finish($current);
                }

                [$message, $context] = $this->splitMessageAndContext($m[4]);

                $current = [
                    'timestamp' => str_replace('T', ' ', $m[1]),
                    'date' => substr($m[1], 0, 10),
                    'channel' => $m[2],
                    'level' => strtoupper($m[3]),
                    'message' => $message,
                    'context' => $context,
                    'trace' => [],
                ];

                continue;
            }

            // Línea suelta antes de cualquier cabecera: no pertenece a ninguna
            // entrada, así que la ignoramos en vez de inventarle un dueño.
            if ($current !== null) {
                $current['trace'][] = $line;
            }
        }

        if ($current !== null) {
            $entries[] = $this->finish($current);
        }

        return array_reverse($entries);
    }

    /**
     * Lee el archivo línea por línea, quedándose con el final cuando excede el tope
     * (las entradas recientes son las que importan para debuggear).
     *
     * @return iterable<string>
     */
    private function lines(): iterable
    {
        $handle = fopen($this->path, 'rb');

        if ($handle === false) {
            return [];
        }

        if ($this->isTruncated()) {
            fseek($handle, -self::MAX_BYTES, SEEK_END);
            fgets($handle); // descartar la línea partida a la mitad
        }

        while (($line = fgets($handle)) !== false) {
            yield rtrim($line, "\r\n");
        }

        fclose($handle);
    }

    /**
     * Separa el mensaje del contexto JSON que Monolog anexa en la misma línea.
     *
     * @return array{0:string, 1:string}
     */
    private function splitMessageAndContext(string $remainder): array
    {
        if (preg_match('/^(.*?)\s(\{.*|\[.*)$/s', $remainder, $m) === 1) {
            return [rtrim($m[1]), $m[2]];
        }

        return [rtrim($remainder), ''];
    }

    /**
     * @param  array<string, mixed>  $entry
     * @return array<string, mixed>
     */
    private function finish(array $entry): array
    {
        $entry['trace'] = rtrim(implode("\n", $entry['trace']));

        // Identificador estable para que el front pueda usarlo como key de lista.
        $entry['id'] = substr(md5($entry['timestamp'].$entry['level'].$entry['message']), 0, 12);

        return $entry;
    }
}
