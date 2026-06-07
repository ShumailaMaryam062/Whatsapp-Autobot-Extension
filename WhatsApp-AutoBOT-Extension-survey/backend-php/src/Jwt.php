<?php
declare(strict_types=1);

final class Jwt
{
    public static function encode(array $payload, string $secret): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $headerEncoded = self::base64UrlEncode((string) json_encode($header, JSON_UNESCAPED_SLASHES));
        $payloadEncoded = self::base64UrlEncode((string) json_encode($payload, JSON_UNESCAPED_SLASHES));

        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    public static function decode(string $jwt, string $secret): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new HttpException(401, 'Invalid token format.');
        }

        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

        $headerJson = self::base64UrlDecode($headerEncoded);
        $payloadJson = self::base64UrlDecode($payloadEncoded);
        $signature = self::base64UrlDecode($signatureEncoded);

        $header = json_decode($headerJson, true);
        $payload = json_decode($payloadJson, true);

        if (!is_array($header) || !is_array($payload)) {
            throw new HttpException(401, 'Invalid token payload.');
        }

        if (($header['alg'] ?? '') !== 'HS256') {
            throw new HttpException(401, 'Unsupported token algorithm.');
        }

        $expected = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        if (!hash_equals($expected, $signature)) {
            throw new HttpException(401, 'Token signature verification failed.');
        }

        $now = time();
        if (isset($payload['exp']) && (int) $payload['exp'] < $now) {
            throw new HttpException(401, 'Token expired.');
        }

        if (isset($payload['nbf']) && (int) $payload['nbf'] > $now) {
            throw new HttpException(401, 'Token not active yet.');
        }

        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }
        return (string) base64_decode(strtr($data, '-_', '+/'));
    }
}
