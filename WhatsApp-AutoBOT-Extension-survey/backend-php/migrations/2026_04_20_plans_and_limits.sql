-- Adds subscription plans and workspace billing limits.
-- Run this after 2026_04_19_init_schema.sql

create table if not exists public.app_plans (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null,
    description text not null default '',
    price_monthly numeric(10,2) not null default 0,
    messages_per_day integer not null default 100,
    ai_replies_per_day integer not null default 50,
    contacts_limit integer not null default 50,
    campaigns_per_month integer not null default 5,
    is_active boolean not null default true,
    is_default boolean not null default false,
    sort_order integer not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.app_workspaces
    add column if not exists plan_id uuid references public.app_plans(id) on delete set null,
    add column if not exists plan_price_monthly numeric(10,2) not null default 0,
    add column if not exists plan_contacts_limit integer not null default 50,
    add column if not exists plan_campaigns_per_month integer not null default 5;

insert into public.app_plans (
    code,
    name,
    description,
    price_monthly,
    messages_per_day,
    ai_replies_per_day,
    contacts_limit,
    campaigns_per_month,
    is_active,
    is_default,
    sort_order
)
values
    (
        'basic',
        'Basic',
        'Great for getting started',
        0,
        100,
        50,
        50,
        5,
        true,
        true,
        10
    ),
    (
        'premium',
        'Premium',
        'For growing teams that need higher limits',
        29,
        1000,
        500,
        2000,
        100,
        true,
        false,
        20
    ),
    (
        'enterprise',
        'Enterprise',
        'Unlimited usage and priority support',
        99,
        -1,
        -1,
        -1,
        -1,
        true,
        false,
        30
    )
on conflict (code)
do update set
    name = excluded.name,
    description = excluded.description,
    price_monthly = excluded.price_monthly,
    messages_per_day = excluded.messages_per_day,
    ai_replies_per_day = excluded.ai_replies_per_day,
    contacts_limit = excluded.contacts_limit,
    campaigns_per_month = excluded.campaigns_per_month,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    updated_at = now();

update public.app_plans
set is_default = false
where is_default = true;

update public.app_plans
set is_default = true
where code = 'basic';

with plan_map as (
    select
        w.id as workspace_id,
        coalesce(
            case
                when lower(coalesce(w.plan_name, '')) in ('premium', 'pro') then 'premium'
                when lower(coalesce(w.plan_name, '')) in ('enterprise', 'business') then 'enterprise'
                else 'basic'
            end,
            'basic'
        ) as code
    from public.app_workspaces w
)
update public.app_workspaces w
set
    plan_id = p.id,
    plan_name = p.name,
    plan_messages_per_day = coalesce(nullif(w.plan_messages_per_day, 0), p.messages_per_day),
    plan_ai_replies_per_day = coalesce(nullif(w.plan_ai_replies_per_day, 0), p.ai_replies_per_day),
    plan_price_monthly = coalesce(w.plan_price_monthly, p.price_monthly),
    plan_contacts_limit = coalesce(w.plan_contacts_limit, p.contacts_limit),
    plan_campaigns_per_month = coalesce(w.plan_campaigns_per_month, p.campaigns_per_month),
    updated_at = now()
from plan_map m
join public.app_plans p on p.code = m.code
where w.id = m.workspace_id;

create index if not exists idx_app_plans_active_sort
    on public.app_plans (is_active, sort_order, price_monthly);

create index if not exists idx_app_workspaces_plan_id
    on public.app_workspaces (plan_id);

-- Keep Basic plan contacts cap enforced by default.
update public.app_workspaces
set plan_contacts_limit = 50,
    updated_at = now()
where lower(coalesce(plan_name, '')) = 'basic'
  and plan_contacts_limit <> 50;
