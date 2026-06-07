<?php
declare(strict_types=1);

final class HttpException extends RuntimeException
{
    private int $status;
    private array $payload;

    public function __construct(int $status, string $message, array $payload = [])
    {
        parent::__construct($message, $status);
        $this->status = $status;
        $this->payload = $payload;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }
}
