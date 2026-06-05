<?php

namespace App\Services;

use App\Modules\Messages\Models\Message;
use App\Modules\Auth\Models\User;

class ContactProtectionService
{
    private array $blockedPatterns = [
        '/\d{10,}/',           // Numbers with 10+ digits
        '/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/', // Phone patterns
        '/\+?\d{1,3}[-.\s]?\d{1,14}/', // International phones
        '/(?:cel|celular|móvil|whatsapp|teléfono|llama|call|txt|text)\s*:?\s*/i',
        '/\b(?:3\d{2}|300|301|302|303|304|305|306|307|308|309|310|311|312|313|314|315|316|317|318|319)\b/',
    ];

    private array $suspiciousDomains = [
        'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'signal.me',
        'discord.gg', 'discord.com/invite', 'instagram.com', 'facebook.com',
    ];

    public function containsPhoneNumber(string $content): bool
    {
        foreach ($this->blockedPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        return false;
    }

    public function containsExternalContact(string $content): bool
    {
        $contentLower = strtolower($content);

        foreach ($this->suspiciousDomains as $domain) {
            if (str_contains($contentLower, $domain)) {
                return true;
            }
        }

        return $this->containsPhoneNumber($content);
    }

    public function containsEvasionAttempt(string $content): bool
    {
        $evasionPatterns = [
            '/\b(?:escribeme|escribeme al|contactame|contacto al|hablame|habla al|mandame|manda al|envíame|envía al)\s+(?:al|por|al número|mensaje|whatsapp|telegram|discord)\b/i',
            '/\b(?:mi|wsp|wasap|wap|wa)\s*[:.]?\s*(?:\d|com|me)\b/i',
            '/\b(?:nuevo|nueva)\s+(?:número|numero|cel|celular|contacto)\b/i',
            '/\b(?:cámbiame|cambia|mis datos|actualiza)\s+(?:mi|número|numero|cel)\b/i',
            '/\b(?:aquí|ahí|este|esete)\s+(?:número|numero|cel|celular)\b/i',
            '/\b(?:nueva|nuevo)\s+(?:cuenta|chat|mensaje)\b/i',
        ];

        foreach ($evasionPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }

        return $this->containsExternalContact($content);
    }

    public function sanitizeContent(string $content, int $senderId): array
    {
        $flags = [];
        $sanitized = $content;

        if ($this->containsPhoneNumber($content)) {
            $flags[] = 'phone_detected';
            $sanitized = preg_replace('/\d{10,}/', '[número bloqueado]', $sanitized);
            $sanitized = preg_replace('/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/', '[número bloqueado]', $sanitized);
        }

        if ($this->containsEvasionAttempt($content)) {
            $flags[] = 'evasion_attempt';
        }

        $this->logAttempt($senderId, $flags, $content);

        return [
            'sanitized' => $sanitized,
            'flags' => $flags,
            'blocked' => in_array('phone_detected', $flags) || in_array('evasion_attempt', $flags),
        ];
    }

    private function logAttempt(int $userId, array $flags, string $content): void
    {
        if (!empty($flags)) {
            \App\Models\ContactProtectionLog::create([
                'user_id' => $userId,
                'flags' => $flags,
                'original_content' => substr($content, 0, 500),
                'created_at' => now(),
            ]);
        }
    }
}