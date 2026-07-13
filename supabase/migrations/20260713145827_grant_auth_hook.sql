grant usage
on schema public
to supabase_auth_admin;

grant execute
on function public.custom_access_token_hook(jsonb)
to supabase_auth_admin;

revoke execute
on function public.custom_access_token_hook(jsonb)
from anon, authenticated, public;