<?php

namespace App\Services;

use Google\Client as GoogleClient;
use RuntimeException;

class GoogleTokenVerifier
{
    public function __construct(private readonly GoogleClient $client)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $token): array
    {
        $payload = $this->client->verifyIdToken($token);

        if (! $payload) {
            throw new RuntimeException('Unable to verify Google token.');
        }

        return $payload;
    }
}
