-- enum

create type member_level as enum ('ceo', 'doctor', 'gen manager', 'staff');
create type notification_status as enum ('pending', 'sent', 'failed');
create type reservation_status as enum ('booked', 'canceled', 'completed');

-- table

create table organization (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table customer (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organization(id),
  name text not null,
  phone text not null
);

create table resource (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organization(id),
  name text not null
);

create table member (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organization(id),
  name text not null,
  level member_level not null default 'staff'
);

create table reservation (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organization(id),
  member_id uuid not null references member(id),
  customer_id uuid not null references customer(id),
  resource_id uuid not null references resource(id),
  price numeric (12, 2) not null default 0,
  check (price >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at),
  status reservation_status not null default 'booked'
);

create table notification (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organization(id),
  reservation_id uuid not null references reservation(id),
  customer_id uuid not null references customer(id),
  content text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at),
  status notification_status not null default 'pending'
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references member(id),
  reservation_id uuid not  null references reservation(id),
  created_at timestamptz not null default now(), 
  action text not null 
);

-- index

create index on customer (org_id);
create index on resource (org_id);
create index on member (org_id);

create index on reservation (org_id, resource_id, starts_at);
create index on reservation (org_id, customer_id, starts_at);
create index on reservation (org_id, starts_at);
create index on reservation (member_id);
create index on reservation (customer_id);
create index on reservation (resource_id);

create index on audit_log (reservation_id);
create index on audit_log (member_id);
create index on audit_log (created_at);

create index on notification (org_id);
create index on notification (reservation_id);
create index on notification (customer_id);

-- security placeholder

alter table reservation enable row level security;

create policy reservation_tmp on reservation using (true);

grant usage on schema public to anon, authenticated;
grant select on table reservation, customer, resource to anon, authenticated;

create function authorize(perm text) returns boolean
  language sql stable as $$ select true $$;
