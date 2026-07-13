-- enum

create type member_level as enum ('ceo', 'doctor', 'gen manager', 'staff');
create type notification_status as enum ('pending', 'sent', 'failed');
create type reservation_status as enum ('booked', 'canceled', 'completed');
create type app_role as enum ('owner', 'admin', 'staff', 'viewer');
create type app_permission as enum (
  'reservation.create',
  'reservation.update',
  'reservation.delete',
  'member.manage'
);


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
  user_id uuid not null,
  name text not null,
  level member_level not null default 'staff',
  role app_role not null default 'staff'
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

-- RBAC

create table role_permissions (
  role app_role not null default 'staff',
  permission app_permission not null,
  primary key (role, permission)
);

insert into role_permissions (role, permission)
values
  ('owner', 'reservation.create'),
  ('owner', 'reservation.update'),
  ('owner', 'reservation.delete'),
  ('owner', 'member.manage'),
  ('admin', 'reservation.create'),
  ('admin', 'reservation.update'),
  ('admin', 'reservation.delete'),
  ('staff', 'reservation.create'),
  ('staff', 'reservation.update');

create function authorize(perm app_permission) returns boolean
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select exists (
      select 1
      from role_permissions
      where role = (auth.jwt() -> 'app_metadata' ->> 'role')::app_role
        and permission = perm
    );
  $$;

create function custom_access_token_hook(event jsonb) returns jsonb
  language plpgsql
  stable
  security definer
  set search_path = public
as $$
declare
  claims jsonb;
  user_role app_role;
begin
  select role into user_role
  from member
  where user_id = (event->>'user_id')::uuid
  limit 1;
  claims := jsonb_set(
    event->'claims',
    '{app_metadata,role}',
    to_jsonb(user_role)
  );

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- security placeholder

alter table reservation enable row level security;
alter table notification enable row level security;

  -- 읽기: 내 회사 행만 보임
create policy reservation_select on reservation 
  for select using (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )
  );

  -- 넣기: 내 회사로만 넣을 수 있음 (org 와 level/role 마다 알림 발송 권한)
create policy reservation_insert on reservation
  for insert with check (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    and authorize('reservation.create')
    )
  );

  -- 수정
create policy reservation_update on reservation
  for update using (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )
    and authorize('reservation.update')

  )
  with check (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )  
    and authorize('reservation.update')
  );

  -- 삭제
create policy reservation_delete on reservation
  for delete using (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )
    and authorize('reservation.delete')
  );

create policy notification_select on notification 
  for select using (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )
  );

create policy notification_insert on notification
  for insert with check (
    org_id in (
      select org_id 
      from member 
      where user_id = auth.uid()
    )
  );

grant usage on schema public to anon, authenticated;
grant select on table reservation, customer, resource, member to anon, authenticated;
grant insert on table notification to anon, authenticated;

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
