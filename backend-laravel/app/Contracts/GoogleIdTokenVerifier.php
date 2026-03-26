<?php

namespace App\Contracts;

interface GoogleIdTokenVerifier
{
    /**
     * @return array<string, mixed>
     */
    public function verify(string $idToken): array;
}
