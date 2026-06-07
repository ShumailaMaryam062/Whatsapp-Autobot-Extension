# Mr CRM PHP Backend (cPanel-ready)

This folder contains a complete replacement backend for your extension, built in pure PHP for easy cPanel deployment.

It includes:

- Extension-compatible API endpoints used by `popup.js`, `background.js`, and `content.js`
- Supabase migration SQL for core schema/tables
- Groq integration:
  - Chat/response model: `openai/gpt-oss-20b`
  - Speech-to-text model: `whisper-large-v3-turbo`
- Admin dashboard (`/admin.php`)

## 1) Deploy on cPanel

1. Upload the entire `backend-php` folder to your hosting account.
2. Set your domain/subdomain document root to:
   - `backend-php/public`
3. Ensure PHP 8.1+ is enabled.
4. Ensure `curl` extension is enabled in PHP.

## 2) Environment setup

1. Copy `.env.example` to `.env`.
2. Fill values in `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `APP_JWT_SECRET` (long random secret)

Admin defaults are already set in `.env.example`:

- Username: `HamzaAkmal`
- Password: `Hamza@1231`

## 3) Run Supabase migration

In Supabase SQL Editor, run:

- `migrations/2026_04_19_init_schema.sql`

This creates all required tables:

- `app_users`
- `app_workspaces`
- `app_workspace_members`
- `app_refresh_tokens`
- `app_usage_counters`
- `app_message_logs`
- `app_message_reply_status`
- `app_contacts`
- `app_ai_configs`
- `app_extension_settings`

## 4) Admin dashboard

Open:

- `/admin.php`

Use admin panel to:

- Create user + workspace
- Generate access/refresh tokens
- Monitor workspaces and usage

## 5) API health

- `GET /api/health`

## 6) Implemented endpoint map

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Workspace

- `GET /api/workspace/me`
- `POST /api/workspace`
- `PATCH /api/workspace/{id}`
- `GET /api/workspace/by-phone/{phone}`
- `POST /api/workspace/switch`
- `POST /api/workspace/me/extension-install-whatsapp-ping`

### AI / Groq

- `GET /api/config/ai-defaults`
- `POST /api/ai/openai-chat`
- `POST /api/ai/openai-transcriptions`
- `POST /api/ai/reply` (legacy compatibility)

### Usage

- `GET /api/usage/today`
- `GET /api/ai/usage/today` (alias)
- `POST /api/usage/track-ai-reply`
- `POST /api/usage/log-message`
- `GET /api/usage/dashboard-stats`

### Contacts / Message status

- `POST /api/contacts/sync`
- `GET /api/contacts/{phone}/messages`
- `GET /api/message-reply-status/check?messageId=...`
- `POST /api/message-reply-status/record`

### Extension metadata

- `GET /api/extension/latest-version`

## 7) Important migration note

Your extension currently uses hardcoded API host `https://api.smartdm.io` in files like:

- `popup.js`
- `background.js`

If your new backend will run on `https://birthday.agent0s.dev`, do one of these:

1. Point `api.smartdm.io` DNS to the new server, or
2. Update extension constants to the new domain and rebuild/reload extension.

## 8) Security recommendations

- Keep `.env` out of version control.
- Rotate exposed keys after production deployment.
- Change admin password immediately after first login.
