<?php
declare(strict_types=1);

final class SupabaseRest
{
    private string $supabaseUrl;
    private string $serviceRoleKey;
    private string $anonKey;
    private HttpClient $http;

    public function __construct(string $supabaseUrl, string $serviceRoleKey, string $anonKey, HttpClient $http)
    {
        $this->supabaseUrl = rtrim($supabaseUrl, '/');
        $this->serviceRoleKey = $serviceRoleKey;
        $this->anonKey = $anonKey;
        $this->http = $http;
    }

    public function request(
        string $method,
        string $path,
        array $query = [],
        mixed $body = null,
        array $headers = [],
        bool $serviceRole = true,
        bool $jsonBody = true
    ): array {
        $key = $serviceRole ? $this->serviceRoleKey : ($this->anonKey !== '' ? $this->anonKey : $this->serviceRoleKey);

        $baseHeaders = [
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
        ];

        $res = $this->http->request(
            $method,
            $this->supabaseUrl . $path,
            $query,
            $body,
            array_merge($baseHeaders, $headers),
            $jsonBody
        );

        return $res;
    }

    public function select(string $table, array $query = [], array $headers = []): array
    {
        return $this->request('GET', '/rest/v1/' . $table, $query, null, $headers, true, true);
    }

    public function insert(string $table, array $rows, array $query = [], array $headers = []): array
    {
        $prefer = $headers['Prefer'] ?? 'return=representation';
        $headers['Prefer'] = $prefer;
        return $this->request('POST', '/rest/v1/' . $table, $query, $rows, $headers, true, true);
    }

    public function update(string $table, array $data, array $filters = [], array $headers = []): array
    {
        $prefer = $headers['Prefer'] ?? 'return=representation';
        $headers['Prefer'] = $prefer;
        return $this->request('PATCH', '/rest/v1/' . $table, $filters, $data, $headers, true, true);
    }

    public function upsert(string $table, array $rows, array $query = [], array $headers = []): array
    {
        $prefer = $headers['Prefer'] ?? 'resolution=merge-duplicates,return=representation';
        $headers['Prefer'] = $prefer;
        return $this->request('POST', '/rest/v1/' . $table, $query, $rows, $headers, true, true);
    }
}
