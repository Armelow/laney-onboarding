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
  status reservation_status not null default 'booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger reservation_set_updated_at
  before update on reservation
  for each row execute function set_updated_at();

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

create function log_reservation_change() returns trigger
  language plpgsql as $$
begin
  insert into audit_log (
    member_id,
    reservation_id,
    action
  )
  values (
    coalesce(new.member_id, old.member_id),
    coalesce(new.id, old.id),
    tg_op
  );

  return coalesce(new, old);
end $$;

create trigger reservation_audit
  after insert or update or delete on reservation 
  for each row execute function log_reservation_change();

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
alter table notification enable row level security;

create policy reservation_tmp on reservation using (true);
create policy notification_tmp
on notification using(true)
with check (true); -- 향후 org 와 level/role 마다 알림 발송 권한 조건 설정 필요

grant usage on schema public to anon, authenticated;
grant select on table reservation, customer, resource to anon, authenticated;
grant insert on table notification to anon, authenticated;

create function authorize(perm text) returns boolean
  language sql stable as $$ select true $$;

-- cron 자동 알림 시스템

create extension if not exists pg_cron;

create function send_reservation_reminders() returns void
  language sql
  as $$
    insert into notification (
      org_id,
      reservation_id,
      customer_id,
      content,
      starts_at,
      ends_at,
      status
    )
    select 
      r.org_id,
      r.id,
      r.customer_id,
      '예약 시작 전 알림',
      now(),
      r.starts_at,
      'sent'
    from reservation r
    where r.starts_at between now() and now() + interval '1 hour'
      and not exists (
        select 1
        from notification n
        where n.reservation_id = r.id
      );
  $$;

  select cron.schedule(
    'reservation-reminders',
    '* * * * *',
    $$ select send_reservation_reminders(); $$
  );
