<?php
declare(strict_types=1);

require_once __DIR__ . '/Env.php';
require_once __DIR__ . '/HttpException.php';
require_once __DIR__ . '/Jwt.php';
require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/SupabaseRest.php';
require_once __DIR__ . '/ApiServices.php';

Env::load(__DIR__ . '/../.env');

date_default_timezone_set('UTC');

function app_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $config = [
        'app_env' => Env::get('APP_ENV', 'production'),
        'app_jwt_secret' => Env::require('APP_JWT_SECRET'),
        'access_token_ttl_seconds' => (int) Env::get('ACCESS_TOKEN_TTL_SECONDS', '3600'),
        'refresh_token_ttl_days' => (int) Env::get('REFRESH_TOKEN_TTL_DAYS', '30'),

        'supabase_url' => Env::require('SUPABASE_URL'),
        'supabase_anon_key' => Env::get('SUPABASE_ANON_KEY', ''),
        'supabase_service_role_key' => Env::require('SUPABASE_SERVICE_ROLE_KEY'),

        'groq_api_key' => Env::require('GROQ_API_KEY'),
        'groq_chat_model' => Env::get('GROQ_CHAT_MODEL', 'openai/gpt-oss-20b'),
        'groq_stt_model' => Env::get('GROQ_STT_MODEL', 'whisper-large-v3-turbo'),

        'admin_username' => Env::get('ADMIN_USERNAME', 'HamzaAkmal'),
        'admin_password' => Env::get('ADMIN_PASSWORD', 'Hamza@1231'),

        'latest_extension_version' => Env::get('LATEST_EXTENSION_VERSION', '3.2.0'),
    ];

    return $config;
}

function app_services(): ApiServices
{
    static $services = null;
    if ($services instanceof ApiServices) {
        return $services;
    }

    $services = new ApiServices(app_config());
    return $services;
}
