-- Migration: Add function to efficiently look up user ID by email
-- This fixes the N+1 query problem in stripe-webhook-simplified.ts
-- where listUsers() was loading ALL users on every checkout event

-- Create a function to get user ID by email (O(1) indexed lookup)
create or replace function get_user_id_by_email(user_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_uuid uuid;
begin
  -- Query auth.users table directly with indexed email lookup
  select id into user_uuid
  from auth.users
  where email = user_email
  limit 1;

  return user_uuid;
end;
$$;

-- Grant execute permission to service_role (used by Edge Functions)
grant execute on function get_user_id_by_email(text) to service_role;

-- Add helpful comment
comment on function get_user_id_by_email is
  'Efficiently lookup user ID by email address. Used by webhook handlers to avoid N+1 queries.';
