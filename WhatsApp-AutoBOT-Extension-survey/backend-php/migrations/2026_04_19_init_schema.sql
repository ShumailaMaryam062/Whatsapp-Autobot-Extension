-- SmartDM PHP backend schema migration for Supabase
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    full_name text not null,
    password_hash text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.app_workspaces (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null references public.app_users(id) on delete cascade,
    name text not null,
    whatsapp_phone text unique,
    plan_name text not null default 'Basic',
    plan_messages_per_day integer not null default 100,
    plan_ai_replies_per_day integer not null default 50,
    extension_install_whatsapp_sent_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.app_workspace_members (
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    user_id uuid not null references public.app_users(id) on delete cascade,
    role text not null default 'member' check (role in ('owner', 'admin', 'member')),
    created_at timestamptz not null default now(),
    primary key (workspace_id, user_id)
);

create table if not exists public.app_refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.app_users(id) on delete cascade,
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.app_usage_counters (
    id bigserial primary key,
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    date date not null,
    messages_sent integer not null default 0,
    ai_replies integer not null default 0,
    campaigns_created integer not null default 0,
    updated_at timestamptz not null default now(),
    unique (workspace_id, date)
);

create table if not exists public.app_message_logs (
    id bigserial primary key,
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    message_id text,
    phone_number text not null,
    contact_name text,
    content text,
    type text not null default 'message',
    direction text not null default 'outbound' check (direction in ('inbound', 'outbound')),
    status text,
    is_ai_generated boolean not null default false,
    ai_generation_time_ms integer,
    campaign_id text,
    flow_id text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    message_timestamp timestamptz
);

create table if not exists public.app_message_reply_status (
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    message_id text not null,
    status text not null check (status in ('replied', 'skipped')),
    handled boolean generated always as (status in ('replied', 'skipped')) stored,
    updated_at timestamptz not null default now(),
    primary key (workspace_id, message_id)
);

create table if not exists public.app_contacts (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.app_workspaces(id) on delete cascade,
    phone_number text not null,
    name text,
    tags text[] not null default '{}',
    status text not null default 'new_lead',
    notes text,
    custom_fields jsonb not null default '{}'::jsonb,
    last_message_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, phone_number)
);

create table if not exists public.app_ai_configs (
    workspace_id uuid primary key references public.app_workspaces(id) on delete cascade,
    model text not null default 'openai/gpt-oss-20b',
    temperature numeric(4,3) not null default 0.700,
    max_tokens integer not null default 500,
    reply_delay integer not null default 2000,
    debounce_time integer not null default 10000,
    enabled boolean not null default true,
    updated_at timestamptz not null default now()
);

create table if not exists public.app_extension_settings (
    id integer primary key default 1 check (id = 1),
    latest_version text not null default '3.2.0',
    updated_at timestamptz not null default now()
);

insert into public.app_extension_settings (id, latest_version)
values (1, '3.2.0')
on conflict (id) do nothing;

create index if not exists idx_app_workspace_members_user on public.app_workspace_members(user_id);
create index if not exists idx_app_refresh_tokens_user on public.app_refresh_tokens(user_id);
create index if not exists idx_app_refresh_tokens_workspace on public.app_refresh_tokens(workspace_id);
create index if not exists idx_app_refresh_tokens_expires on public.app_refresh_tokens(expires_at);
create index if not exists idx_app_usage_workspace_date on public.app_usage_counters(workspace_id, date);
create index if not exists idx_app_logs_workspace_time on public.app_message_logs(workspace_id, created_at desc);
create index if not exists idx_app_logs_workspace_phone on public.app_message_logs(workspace_id, phone_number);
create index if not exists idx_app_logs_workspace_message_time on public.app_message_logs(workspace_id, message_timestamp desc);
create index if not exists idx_app_contacts_workspace_phone on public.app_contacts(workspace_id, phone_number);

-- Optional starter SQL account (disabled by default):
-- insert into public.app_users (email, full_name, password_hash)
-- values ('owner@example.com', 'Owner', crypt('ChangeMe123!', gen_salt('bf')));
