create table if not exists public.finance_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_profiles enable row level security;

drop policy if exists "Users can read own finance profile" on public.finance_profiles;
create policy "Users can read own finance profile"
  on public.finance_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own finance profile" on public.finance_profiles;
create policy "Users can insert own finance profile"
  on public.finance_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own finance profile" on public.finance_profiles;
create policy "Users can update own finance profile"
  on public.finance_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_finance_profiles_updated_at on public.finance_profiles;
create trigger set_finance_profiles_updated_at
  before update on public.finance_profiles
  for each row
  execute function public.set_updated_at();
