-- Profiles table (auto-created on user signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  company text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  invoice_count_this_month int not null default 0,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Invoices table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_url text not null,
  file_name text not null,
  file_hash text not null,
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'completed', 'failed')),
  raw_text text,
  extracted_data jsonb,
  vendor_name text,
  invoice_number text,
  invoice_date date,
  total_amount numeric,
  currency text,
  tax_amount numeric,
  subtotal_amount numeric,
  category text,
  confidence_score float,
  duplicate_of uuid references public.invoices(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices"
  on public.invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices"
  on public.invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices"
  on public.invoices for delete using (auth.uid() = user_id);

create index idx_invoices_user_id on public.invoices(user_id);
create index idx_invoices_status on public.invoices(status);
create index idx_invoices_vendor_name on public.invoices(vendor_name);
create index idx_invoices_created_at on public.invoices(created_at desc);
create index idx_invoices_file_hash on public.invoices(file_hash);

-- Line items (schema only, automated extraction deferred to Phase 2)
create table public.line_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric,
  unit_price numeric,
  total numeric not null,
  category text
);

alter table public.line_items enable row level security;

create policy "Users can manage own line items"
  on public.line_items for all
  using (
    invoice_id in (select id from public.invoices where user_id = auth.uid())
  );

-- Vendor patterns (for learning from corrections)
create table public.vendor_patterns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  vendor_name text not null,
  field_patterns jsonb not null default '{}',
  sample_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_patterns enable row level security;

create policy "Users can view own vendor patterns"
  on public.vendor_patterns for select using (auth.uid() = user_id);
create policy "Users can insert own vendor patterns"
  on public.vendor_patterns for insert with check (auth.uid() = user_id);
create policy "Users can update own vendor patterns"
  on public.vendor_patterns for update using (auth.uid() = user_id);

create unique index idx_vendor_patterns_user_vendor
  on public.vendor_patterns(user_id, vendor_name);

-- RPC function for atomic field edit + denormalized column sync
create or replace function public.update_invoice_field(
  p_invoice_id uuid,
  p_field_name text,
  p_value text,
  p_update_vendor boolean default false
)
returns void as $$
declare
  v_extracted jsonb;
  v_vendor text;
begin
  select extracted_data, vendor_name into v_extracted, v_vendor
  from public.invoices
  where id = p_invoice_id and user_id = auth.uid();

  if not found then
    raise exception 'Invoice not found';
  end if;

  v_extracted := jsonb_set(
    coalesce(v_extracted, '{}'),
    array[p_field_name],
    jsonb_build_object('value', p_value, 'confidence', 1.0, 'source', 'manual')
  );

  update public.invoices
  set
    extracted_data = v_extracted,
    vendor_name = case when p_field_name = 'vendor_name' then p_value else vendor_name end,
    invoice_number = case when p_field_name = 'invoice_number' then p_value else invoice_number end,
    invoice_date = case when p_field_name = 'date' then p_value::date else invoice_date end,
    total_amount = case when p_field_name = 'total' then p_value::numeric else total_amount end,
    currency = case when p_field_name = 'currency' then p_value else currency end,
    tax_amount = case when p_field_name = 'tax' then p_value::numeric else tax_amount end,
    subtotal_amount = case when p_field_name = 'subtotal' then p_value::numeric else subtotal_amount end,
    updated_at = now()
  where id = p_invoice_id and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- RPC for atomic invoice count increment
create or replace function public.increment_invoice_count(user_id_param uuid)
returns void as $$
begin
  update public.profiles
  set invoice_count_this_month = invoice_count_this_month + 1
  where id = user_id_param;
end;
$$ language plpgsql security definer;

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.update_updated_at();

create trigger update_vendor_patterns_updated_at
  before update on public.vendor_patterns
  for each row execute procedure public.update_updated_at();

-- Storage bucket for invoices
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoices',
  'invoices',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
);

-- Storage RLS
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own files"
  on storage.objects for select
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

-- Monthly invoice count reset (requires pg_cron extension on Supabase Pro)
-- Run manually in SQL Editor if pg_cron is not available:
-- select cron.schedule('reset-monthly-counts', '0 0 1 * *',
--   $$update public.profiles set invoice_count_this_month = 0$$);
