# Mirqolyzer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Mirqolyzer, an invoice analyzer SaaS that uses OCR + rule-based parsing (no LLM) to extract structured data from uploaded invoices and receipts.

**Architecture:** Next.js 15 App Router with server-side OCR pipeline (pdf-parse for text PDFs, Tesseract.js for scanned images). Supabase handles auth, database (PostgreSQL + RLS), and file storage. Stripe for billing with 3 tiers.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (@supabase/ssr), Tesseract.js, pdf-parse, Stripe, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-03-22-mirqolyzer-mvp-design.md`

---

## File Map

### Core Types
- `src/types/invoice.ts` — Invoice, ExtractedField, ExtractedData, InvoiceStatus types
- `src/types/user.ts` — Profile, Plan types
- `src/types/billing.ts` — Stripe plan config, usage limits
- `src/types/extraction.ts` — ExtractionResult, FieldConfidence, VendorPattern types

### Supabase Layer
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server-side Supabase client (cookies)
- `src/lib/supabase/middleware.ts` — Session refresh middleware helper
- `src/lib/supabase/types.ts` — Generated database types
- `supabase/migrations/001_initial_schema.sql` — All tables + RLS + triggers
- `supabase/seed.sql` — Dev seed data

### OCR Pipeline
- `src/lib/ocr/pdf-parser.ts` — Extract text from text-based PDFs via pdf-parse
- `src/lib/ocr/tesseract-worker.ts` — OCR scanned images via Tesseract.js server-side
- `src/lib/ocr/pipeline.ts` — Orchestrator: detect type → route to parser → return raw text

### Extraction Engine
- `src/lib/extraction/regex-patterns.ts` — All regex patterns for field extraction (includes date + amount parsing)
- `src/lib/extraction/field-extractor.ts` — Orchestrator: raw text → extracted fields
- `src/lib/extraction/confidence-scorer.ts` — Score each extracted field 0-1

### Vendor Learning
- `src/lib/vendor-learning/pattern-store.ts` — CRUD vendor patterns in Supabase
- `src/lib/vendor-learning/pattern-matcher.ts` — Apply vendor patterns to raw text

### Duplicate Detection
- `src/lib/duplicate/hash-generator.ts` — SHA-256 file hashing
- `src/lib/duplicate/similarity-matcher.ts` — Fuzzy match: vendor + amount + date

### Stripe
- `src/lib/stripe/client.ts` — Stripe SDK instance
- `src/lib/stripe/plans.ts` — Plan definitions + limit lookup
- `src/lib/stripe/webhooks.ts` — Webhook event handlers

### Utilities
- `src/lib/utils/file-validators.ts` — File type + size validation
- `src/lib/utils/format-currency.ts` — Format amounts for display
- `src/lib/utils/date-helpers.ts` — Date formatting utilities

### API Routes
- `src/app/api/invoices/route.ts` — GET list (paginated, filtered, sorted)
- `src/app/api/invoices/upload/route.ts` — POST upload + process
- `src/app/api/invoices/[id]/route.ts` — GET detail, PATCH edit, DELETE
- `src/app/api/invoices/export/route.ts` — GET CSV/JSON export
- `src/app/api/stripe/checkout/route.ts` — POST create Checkout session
- `src/app/api/stripe/portal/route.ts` — POST create Customer Portal
- `src/app/api/webhooks/stripe/route.ts` — POST Stripe webhook handler

### Auth Pages
- `src/app/(auth)/login/page.tsx` — Login form
- `src/app/(auth)/signup/page.tsx` — Signup form
- `src/app/(auth)/callback/route.ts` — OAuth callback handler

### Dashboard Pages
- `src/app/(dashboard)/layout.tsx` — Sidebar + header layout
- `src/app/(dashboard)/dashboard/page.tsx` — Stats + recent invoices
- `src/app/(dashboard)/invoices/[id]/page.tsx` — Invoice detail view
- `src/app/(dashboard)/settings/page.tsx` — User profile settings
- `src/app/(dashboard)/billing/page.tsx` — Plan management

### Marketing Pages
- `src/app/(marketing)/layout.tsx` — Marketing layout (navbar + footer)
- `src/app/(marketing)/page.tsx` — Landing page
- `src/app/(marketing)/pricing/page.tsx` — Pricing comparison

### Components
- `src/components/layout/sidebar.tsx` — Dashboard sidebar nav
- `src/components/layout/header.tsx` — Dashboard header with user menu
- `src/components/layout/mobile-nav.tsx` — Mobile navigation drawer
- `src/components/invoices/invoice-uploader.tsx` — Drag & drop upload zone
- `src/components/invoices/invoice-card.tsx` — Invoice list card
- `src/components/invoices/extraction-view.tsx` — Side-by-side doc + extracted data
- `src/components/invoices/field-editor.tsx` — Inline field editing with confidence colors
- `src/components/dashboard/stats.tsx` — Dashboard statistics cards
- `src/components/dashboard/recent-invoices.tsx` — Recent invoices list
- `src/components/dashboard/category-chart.tsx` — Category distribution chart (deferred — stub only)
- `src/components/marketing/hero.tsx` — Landing hero section
- `src/components/marketing/features.tsx` — Features section
- `src/components/marketing/pricing-section.tsx` — Pricing cards
- `src/components/marketing/cta.tsx` — Call to action section

### Config
- `.env.example` — All env vars documented
- `middleware.ts` — Next.js middleware for auth + session refresh
- `vitest.config.ts` — Test configuration
- `tailwind.config.ts` — Custom theme (colors, fonts)

### Tests
- `src/lib/extraction/__tests__/regex-patterns.test.ts`
- `src/lib/extraction/__tests__/field-extractor.test.ts`
- `src/lib/extraction/__tests__/confidence-scorer.test.ts`
- `src/lib/ocr/__tests__/pdf-parser.test.ts`
- `src/lib/ocr/__tests__/pipeline.test.ts`
- `src/lib/duplicate/__tests__/hash-generator.test.ts`
- `src/lib/duplicate/__tests__/similarity-matcher.test.ts`
- `src/lib/utils/__tests__/file-validators.test.ts`
- `src/lib/stripe/__tests__/plans.test.ts`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.example`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js 15 project**

```bash
cd /c/ClaudecodeProjects/Mirqolyzer
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full Next.js project structure.

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr tesseract.js pdf-parse stripe @stripe/stripe-js lucide-react recharts clsx tailwind-merge class-variance-authority next-themes
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/pdf-parse
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables yes.

- [ ] **Step 5: Add shadcn components we'll need**

```bash
npx shadcn@latest add button card input label badge dialog dropdown-menu separator sheet table tabs toast sonner select
```

- [ ] **Step 6: Create `.env.example`**

Create `c:\ClaudecodeProjects\Mirqolyzer\.env.example`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.local` for development.

- [ ] **Step 7: Create `.env.local` (gitignored)**

```bash
cp .env.example .env.local
```

- [ ] **Step 8: Configure Tailwind theme**

Edit `tailwind.config.ts` — extend with Mirqolyzer brand colors:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8eef5",
          100: "#c5d5e8",
          200: "#9fb9d9",
          300: "#7a9dca",
          400: "#5e87be",
          500: "#4271b2",
          600: "#365d96",
          700: "#2a4a7a",
          800: "#1e3a5f",
          900: "#132844",
          950: "#0a1929",
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#4ade80",
          dark: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 9: Set up global CSS with brand tokens**

Replace `src/app/globals.css` with brand tokens + dark mode support:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 210 40% 10%;
    --card: 0 0% 100%;
    --card-foreground: 210 40% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 210 40% 10%;
    --primary: 213 52% 24%;
    --primary-foreground: 0 0% 98%;
    --secondary: 210 20% 96%;
    --secondary-foreground: 210 40% 10%;
    --muted: 210 20% 96%;
    --muted-foreground: 210 15% 45%;
    --accent: 210 20% 96%;
    --accent-foreground: 210 40% 10%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 210 20% 90%;
    --input: 210 20% 90%;
    --ring: 213 52% 24%;
    --radius: 0.5rem;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
  }

  .dark {
    --background: 220 20% 6%;
    --foreground: 0 0% 95%;
    --card: 220 20% 9%;
    --card-foreground: 0 0% 95%;
    --popover: 220 20% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 213 52% 40%;
    --primary-foreground: 0 0% 98%;
    --secondary: 220 15% 15%;
    --secondary-foreground: 0 0% 95%;
    --muted: 220 15% 15%;
    --muted-foreground: 210 10% 55%;
    --accent: 220 15% 15%;
    --accent-foreground: 0 0% 95%;
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 98%;
    --border: 220 15% 18%;
    --input: 220 15% 18%;
    --ring: 213 52% 40%;
  }
}
```

- [ ] **Step 10: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/test-setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 11: Verify project builds**

```bash
npm run build
```

Expected: successful build with no errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind, shadcn/ui, and brand config"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/invoice.ts`, `src/types/user.ts`, `src/types/billing.ts`, `src/types/extraction.ts`

- [ ] **Step 1: Create invoice types**

Create `src/types/invoice.ts`:

```typescript
export type InvoiceStatus = "uploading" | "processing" | "completed" | "failed";

export type FieldSource = "regex" | "vendor_pattern" | "manual";

export interface ExtractedField<T = string> {
  value: T;
  confidence: number;
  source: FieldSource;
}

export interface ExtractedData {
  invoice_number: ExtractedField<string>;
  date: ExtractedField<string>;
  total: ExtractedField<number>;
  subtotal: ExtractedField<number>;
  tax: ExtractedField<number>;
  currency: ExtractedField<string>;
  vendor_name: ExtractedField<string>;
}

export interface Invoice {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_hash: string;
  status: InvoiceStatus;
  raw_text: string | null;
  extracted_data: ExtractedData | null;
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number | null;
  currency: string | null;
  tax_amount: number | null;
  subtotal_amount: number | null;
  category: string | null;
  confidence_score: number | null;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  category?: string;
  vendor_name?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  q?: string;
  sort_by?: "created_at" | "invoice_date" | "total_amount" | "vendor_name";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
```

- [ ] **Step 2: Create user types**

Create `src/types/user.ts`:

```typescript
export type Plan = "free" | "pro" | "business";

export interface Profile {
  id: string;
  full_name: string;
  company: string | null;
  plan: Plan;
  invoice_count_this_month: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 3: Create billing types**

Create `src/types/billing.ts`:

```typescript
import { Plan } from "./user";

export interface PlanConfig {
  name: string;
  plan: Plan;
  price: number;
  invoices_per_month: number;
  features: string[];
  stripe_price_id: string | null;
  popular?: boolean;
}

export interface UsageLimits {
  invoices_per_month: number;
  can_export_json: boolean;
  can_use_vendor_learning: boolean;
}
```

- [ ] **Step 4: Create extraction types**

Create `src/types/extraction.ts`:

```typescript
export interface ExtractionResult {
  raw_text: string;
  extracted_data: import("./invoice").ExtractedData;
  confidence_score: number;
  processing_time_ms: number;
}

export interface VendorPattern {
  id: string;
  user_id: string;
  vendor_name: string;
  field_patterns: Record<string, FieldPattern>;
  sample_count: number;
  created_at: string;
  updated_at: string;
}

export interface FieldPattern {
  regex: string;
  anchor: string;
  position: "before" | "after" | "line";
}
```

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions for invoice, user, billing, extraction"
```

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Create: `middleware.ts` (root)

- [ ] **Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create middleware helper**

Create `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Create root middleware**

Create `middleware.ts` (in project root, NOT src/):

```typescript
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/ middleware.ts
git commit -m "feat: configure Supabase clients (browser, server, middleware) with auth protection"
```

---

## Task 4: Database Schema & RLS

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`, `supabase/seed.sql`

- [ ] **Step 1: Create migration directory**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write initial schema migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
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

-- Indexes for filtering/sorting
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
  -- Get current extracted_data
  select extracted_data, vendor_name into v_extracted, v_vendor
  from public.invoices
  where id = p_invoice_id and user_id = auth.uid();

  if not found then
    raise exception 'Invoice not found';
  end if;

  -- Update the field in extracted_data
  v_extracted := jsonb_set(
    coalesce(v_extracted, '{}'),
    array[p_field_name],
    jsonb_build_object('value', p_value, 'confidence', 1.0, 'source', 'manual')
  );

  -- Update invoice with both JSONB and denormalized column
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
  10485760, -- 10MB
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
);

-- Storage RLS: users can only access their own folder
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own files"
  on storage.objects for select
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

-- RPC for atomic invoice count increment
create or replace function public.increment_invoice_count(user_id_param uuid)
returns void as $$
begin
  update public.profiles
  set invoice_count_this_month = invoice_count_this_month + 1
  where id = user_id_param;
end;
$$ language plpgsql security definer;

-- Monthly invoice count reset via pg_cron (requires Supabase Pro or pg_cron extension)
-- Run this manually in SQL Editor if pg_cron is not available:
-- select cron.schedule('reset-monthly-counts', '0 0 1 * *',
--   $$update public.profiles set invoice_count_this_month = 0$$);
--
-- Alternative: Create a Supabase Edge Function triggered by a cron job
-- that calls: UPDATE profiles SET invoice_count_this_month = 0;
```

- [ ] **Step 3: Create seed data**

Create `supabase/seed.sql`:

```sql
-- Seed data is managed through Supabase Auth UI for user creation.
-- After creating a test user via the app, use this to set up test data:

-- Example: Set a test user to pro plan (replace UUID)
-- update public.profiles set plan = 'pro' where id = 'YOUR_USER_UUID';
```

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration with RLS, triggers, and storage bucket"
```

---

## Task 5: Auth Pages (Login + Signup + Callback)

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/callback/route.ts`

- [ ] **Step 1: Create auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 to-brand-800">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

Create `src/app/(auth)/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <Card className="border-brand-700/50 bg-white/5 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          <span className="font-bold">Mirqo</span>
          <span className="font-light">lyzer</span>
        </CardTitle>
        <CardDescription className="text-brand-200">Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-red-400">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-100">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-100">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400"
            />
          </div>
          <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-500" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-brand-400">or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full border-brand-600 text-brand-100 hover:bg-white/10" onClick={handleGoogleLogin}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-brand-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-100 underline hover:text-white">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 3: Create signup page**

Create `src/app/(auth)/signup/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <Card className="border-brand-700/50 bg-white/5 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          <span className="font-bold">Mirqo</span>
          <span className="font-light">lyzer</span>
        </CardTitle>
        <CardDescription className="text-brand-200">Create your free account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-red-400">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-brand-100">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-100">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-100">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="bg-white/10 border-brand-600 text-white placeholder:text-brand-400"
            />
          </div>
          <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-500" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-brand-400">or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full border-brand-600 text-brand-100 hover:bg-white/10" onClick={handleGoogleSignup}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-brand-300">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-100 underline hover:text-white">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Create OAuth callback route**

Create `src/app/(auth)/callback/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: successful build.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add auth pages (login, signup, OAuth callback) with Supabase"
```

---

## Task 6: Utility Functions & Validators

**Files:**
- Create: `src/lib/utils/file-validators.ts`, `src/lib/utils/format-currency.ts`, `src/lib/utils/date-helpers.ts`
- Test: `src/lib/utils/__tests__/file-validators.test.ts`

- [ ] **Step 1: Write file validator tests**

Create `src/lib/utils/__tests__/file-validators.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateFileType, validateFileSize, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../file-validators";

describe("validateFileType", () => {
  it("accepts PDF files", () => {
    expect(validateFileType("application/pdf")).toBe(true);
  });

  it("accepts PNG files", () => {
    expect(validateFileType("image/png")).toBe(true);
  });

  it("accepts JPEG files", () => {
    expect(validateFileType("image/jpeg")).toBe(true);
  });

  it("accepts WEBP files", () => {
    expect(validateFileType("image/webp")).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(validateFileType("text/plain")).toBe(false);
    expect(validateFileType("application/zip")).toBe(false);
    expect(validateFileType("image/gif")).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under 10MB", () => {
    expect(validateFileSize(5 * 1024 * 1024)).toBe(true);
  });

  it("accepts files exactly 10MB", () => {
    expect(validateFileSize(MAX_FILE_SIZE)).toBe(true);
  });

  it("rejects files over 10MB", () => {
    expect(validateFileSize(11 * 1024 * 1024)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/utils/__tests__/file-validators.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement file validators**

Create `src/lib/utils/file-validators.ts`:

```typescript
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(sizeInBytes: number): boolean {
  return sizeInBytes <= MAX_FILE_SIZE;
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/utils/__tests__/file-validators.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Create format-currency utility**

Create `src/lib/utils/format-currency.ts`:

```typescript
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  MXN: "$",
  CAD: "CA$",
  AUD: "A$",
};

export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}
```

- [ ] **Step 6: Create date helpers**

Create `src/lib/utils/date-helpers.ts`:

```typescript
export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateString);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils/
git commit -m "feat: add file validators, currency formatter, and date helpers with tests"
```

---

## Task 7: Stripe Plans & Config

**Files:**
- Create: `src/lib/stripe/client.ts`, `src/lib/stripe/plans.ts`
- Test: `src/lib/stripe/__tests__/plans.test.ts`

- [ ] **Step 1: Write plans test**

Create `src/lib/stripe/__tests__/plans.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getPlanLimits, PLANS, getPlanByPriceId } from "../plans";

describe("getPlanLimits", () => {
  it("returns free plan limits", () => {
    const limits = getPlanLimits("free");
    expect(limits.invoices_per_month).toBe(5);
    expect(limits.can_export_json).toBe(false);
    expect(limits.can_use_vendor_learning).toBe(false);
  });

  it("returns pro plan limits", () => {
    const limits = getPlanLimits("pro");
    expect(limits.invoices_per_month).toBe(50);
    expect(limits.can_export_json).toBe(true);
    expect(limits.can_use_vendor_learning).toBe(true);
  });

  it("returns business plan limits", () => {
    const limits = getPlanLimits("business");
    expect(limits.invoices_per_month).toBe(500);
    expect(limits.can_export_json).toBe(true);
    expect(limits.can_use_vendor_learning).toBe(true);
  });

  it("defaults to free for unknown plans", () => {
    const limits = getPlanLimits("unknown" as any);
    expect(limits.invoices_per_month).toBe(5);
  });
});

describe("PLANS", () => {
  it("has 3 plans", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("marks pro as popular", () => {
    const pro = PLANS.find((p) => p.plan === "pro");
    expect(pro?.popular).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/stripe/__tests__/plans.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement plans**

Create `src/lib/stripe/plans.ts`:

```typescript
import type { Plan } from "@/types/user";
import type { PlanConfig, UsageLimits } from "@/types/billing";

export const PLANS: PlanConfig[] = [
  {
    name: "Free",
    plan: "free",
    price: 0,
    invoices_per_month: 5,
    stripe_price_id: null,
    features: [
      "5 invoices per month",
      "OCR text extraction",
      "CSV export",
      "Duplicate detection",
    ],
  },
  {
    name: "Pro",
    plan: "pro",
    price: 29,
    invoices_per_month: 50,
    stripe_price_id: process.env.STRIPE_PRICE_PRO ?? null,
    popular: true,
    features: [
      "50 invoices per month",
      "OCR text extraction",
      "CSV + JSON export",
      "Duplicate detection",
      "Vendor pattern learning",
    ],
  },
  {
    name: "Business",
    plan: "business",
    price: 59,
    invoices_per_month: 500,
    stripe_price_id: process.env.STRIPE_PRICE_BUSINESS ?? null,
    features: [
      "500 invoices per month",
      "OCR text extraction",
      "CSV + JSON export",
      "Duplicate detection",
      "Vendor pattern learning",
      "Priority support",
    ],
  },
];

const PLAN_LIMITS: Record<Plan, UsageLimits> = {
  free: { invoices_per_month: 5, can_export_json: false, can_use_vendor_learning: false },
  pro: { invoices_per_month: 50, can_export_json: true, can_use_vendor_learning: true },
  business: { invoices_per_month: 500, can_export_json: true, can_use_vendor_learning: true },
};

export function getPlanLimits(plan: Plan): UsageLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function getPlanByPriceId(priceId: string): Plan | null {
  const found = PLANS.find((p) => p.stripe_price_id === priceId);
  return found?.plan ?? null;
}
```

- [ ] **Step 4: Create Stripe client**

Create `src/lib/stripe/client.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/lib/stripe/__tests__/plans.test.ts
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/stripe/
git commit -m "feat: add Stripe client and plan configuration with usage limits"
```

---

## Task 8: Extraction Engine — Regex Patterns (TDD)

**Files:**
- Create: `src/lib/extraction/regex-patterns.ts`
- Test: `src/lib/extraction/__tests__/regex-patterns.test.ts`

- [ ] **Step 1: Write regex pattern tests**

Create `src/lib/extraction/__tests__/regex-patterns.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  extractInvoiceNumber,
  extractDates,
  extractAmounts,
  extractVendorName,
  extractTax,
  extractTotal,
  extractSubtotal,
  extractCurrency,
} from "../regex-patterns";

describe("extractInvoiceNumber", () => {
  it("matches 'Invoice #12345'", () => {
    const result = extractInvoiceNumber("Invoice #12345\nSome other text");
    expect(result).toEqual({ value: "12345", confidence: 0.95 });
  });

  it("matches 'Invoice No. ABC-2025-001'", () => {
    const result = extractInvoiceNumber("Invoice No. ABC-2025-001\nDate: 2025-01-15");
    expect(result).toEqual({ value: "ABC-2025-001", confidence: 0.95 });
  });

  it("matches 'Factura 00123'", () => {
    const result = extractInvoiceNumber("Factura 00123\nFecha: 15/01/2025");
    expect(result).toEqual({ value: "00123", confidence: 0.9 });
  });

  it("matches 'Inv. 789'", () => {
    const result = extractInvoiceNumber("Inv. 789\nVendor: Acme Corp");
    expect(result).toEqual({ value: "789", confidence: 0.9 });
  });

  it("returns null when no pattern matches", () => {
    const result = extractInvoiceNumber("Just some random text\nWith no invoice info");
    expect(result).toBeNull();
  });
});

describe("extractDates", () => {
  it("matches DD/MM/YYYY", () => {
    const results = extractDates("Date: 15/01/2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches MM-DD-YYYY", () => {
    const results = extractDates("Date: 01-15-2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches 'Jan 15, 2025'", () => {
    const results = extractDates("Invoice Date: Jan 15, 2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches ISO format YYYY-MM-DD", () => {
    const results = extractDates("Date: 2025-01-15");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("returns empty array for no dates", () => {
    const results = extractDates("No dates here");
    expect(results).toEqual([]);
  });
});

describe("extractAmounts", () => {
  it("matches $1,234.56", () => {
    const results = extractAmounts("Total: $1,234.56");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(1234.56);
  });

  it("matches 1.234,56 (European format)", () => {
    const results = extractAmounts("Total: 1.234,56 EUR");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(1234.56);
  });

  it("matches simple amounts like 99.99", () => {
    const results = extractAmounts("Price: 99.99");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(99.99);
  });

  it("returns empty for no amounts", () => {
    const results = extractAmounts("No amounts here");
    expect(results).toEqual([]);
  });
});

describe("extractCurrency", () => {
  it("detects USD from $ symbol", () => {
    expect(extractCurrency("Total: $500.00")).toBe("USD");
  });

  it("detects EUR from text", () => {
    expect(extractCurrency("Total: 500.00 EUR")).toBe("EUR");
  });

  it("detects MXN from text", () => {
    expect(extractCurrency("Total: $500.00 MXN")).toBe("MXN");
  });

  it("defaults to USD", () => {
    expect(extractCurrency("Total: 500.00")).toBe("USD");
  });
});

describe("extractTotal", () => {
  it("extracts amount after 'Total'", () => {
    const text = "Subtotal: $100.00\nTax: $8.00\nTotal: $108.00";
    const result = extractTotal(text);
    expect(result?.value).toBe(108.0);
    expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("extracts amount after 'Amount Due'", () => {
    const text = "Amount Due: $250.00";
    const result = extractTotal(text);
    expect(result?.value).toBe(250.0);
  });

  it("extracts amount after 'Balance Due'", () => {
    const text = "Balance Due: $75.50";
    const result = extractTotal(text);
    expect(result?.value).toBe(75.5);
  });
});

describe("extractTax", () => {
  it("extracts amount after 'Tax'", () => {
    const result = extractTax("Tax: $8.00\nTotal: $108.00");
    expect(result?.value).toBe(8.0);
  });

  it("extracts amount after 'IVA'", () => {
    const result = extractTax("IVA: $16.00");
    expect(result?.value).toBe(16.0);
  });

  it("extracts amount after 'VAT'", () => {
    const result = extractTax("VAT 20%: $20.00");
    expect(result?.value).toBe(20.0);
  });
});

describe("extractSubtotal", () => {
  it("extracts amount after 'Subtotal'", () => {
    const result = extractSubtotal("Subtotal: $100.00\nTax: $8.00");
    expect(result?.value).toBe(100.0);
  });

  it("extracts amount after 'Sub-total'", () => {
    const result = extractSubtotal("Sub-total: $85.00");
    expect(result?.value).toBe(85.0);
  });
});

describe("extractVendorName", () => {
  it("extracts first prominent text line", () => {
    const text = "ACME CORPORATION\n123 Business St\nInvoice #12345";
    const result = extractVendorName(text);
    expect(result?.value).toBe("ACME CORPORATION");
  });

  it("skips common non-vendor lines", () => {
    const text = "INVOICE\nBEST COMPANY LLC\n123 Main St";
    const result = extractVendorName(text);
    expect(result?.value).toBe("BEST COMPANY LLC");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/extraction/__tests__/regex-patterns.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement regex patterns**

Create `src/lib/extraction/regex-patterns.ts`:

```typescript
interface FieldMatch {
  value: string | number;
  confidence: number;
}

// ── Invoice Number ──────────────────────────────────────────────

const INVOICE_NUMBER_PATTERNS = [
  { regex: /(?:invoice|inv)[\s.#:]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.95 },
  { regex: /(?:factura|recibo)[\s.#:]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.9 },
  { regex: /(?:no|number|num)[\s.#:]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.85 },
  { regex: /#\s*([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.8 },
];

export function extractInvoiceNumber(text: string): FieldMatch | null {
  for (const { regex, confidence } of INVOICE_NUMBER_PATTERNS) {
    const match = text.match(regex);
    if (match?.[1]) {
      return { value: match[1].trim(), confidence };
    }
  }
  return null;
}

// ── Dates ───────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04",
  june: "06", july: "07", august: "08", september: "09",
  october: "10", november: "11", december: "12",
};

interface DateMatch {
  value: string; // ISO YYYY-MM-DD
  confidence: number;
}

export function extractDates(text: string): DateMatch[] {
  const dates: DateMatch[] = [];

  // ISO: YYYY-MM-DD
  const isoRegex = /(\d{4})-(\d{2})-(\d{2})/g;
  let match;
  while ((match = isoRegex.exec(text)) !== null) {
    dates.push({ value: `${match[1]}-${match[2]}-${match[3]}`, confidence: 0.95 });
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/g;
  while ((match = dmy.exec(text)) !== null) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      dates.push({ value: `${year}-${month}-${day}`, confidence: 0.85 });
    }
  }

  // "Jan 15, 2025" or "January 15, 2025"
  const named = /(\w+)\s+(\d{1,2}),?\s+(\d{4})/g;
  while ((match = named.exec(text)) !== null) {
    const monthStr = MONTH_MAP[match[1].toLowerCase()];
    if (monthStr) {
      const day = match[2].padStart(2, "0");
      dates.push({ value: `${match[3]}-${monthStr}-${day}`, confidence: 0.9 });
    }
  }

  return dates;
}

// ── Amounts ─────────────────────────────────────────────────────

interface AmountMatch {
  value: number;
  confidence: number;
  raw: string;
}

export function extractAmounts(text: string): AmountMatch[] {
  const amounts: AmountMatch[] = [];

  // US format: $1,234.56 or 1,234.56
  const usRegex = /[$\u20AC\u00A3]?\s?(\d{1,3}(?:,\d{3})*\.\d{2})\b/g;
  let match;
  while ((match = usRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(value) && value > 0) {
      amounts.push({ value, confidence: 0.9, raw: match[0] });
    }
  }

  // European format: 1.234,56
  const euRegex = /(\d{1,3}(?:\.\d{3})*,\d{2})\b/g;
  while ((match = euRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(value) && value > 0) {
      amounts.push({ value, confidence: 0.85, raw: match[0] });
    }
  }

  // Simple: 99.99 (no thousands separator)
  const simpleRegex = /(?<!\d[.,])(\d+\.\d{2})(?!\d)/g;
  while ((match = simpleRegex.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    // Avoid duplicates from US regex
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.8, raw: match[0] });
    }
  }

  return amounts;
}

// ── Currency ────────────────────────────────────────────────────

export function extractCurrency(text: string): string {
  const upper = text.toUpperCase();
  if (/\bMXN\b/.test(upper)) return "MXN";
  if (/\bEUR\b/.test(upper) || /\u20AC/.test(text)) return "EUR";
  if (/\bGBP\b/.test(upper) || /\u00A3/.test(text)) return "GBP";
  if (/\bCAD\b/.test(upper)) return "CAD";
  if (/\bAUD\b/.test(upper)) return "AUD";
  return "USD";
}

// ── Labeled Amount Extraction ───────────────────────────────────

function extractLabeledAmount(text: string, labels: RegExp): FieldMatch | null {
  const lines = text.split("\n");
  for (const line of lines) {
    if (labels.test(line)) {
      const amounts = extractAmounts(line);
      if (amounts.length > 0) {
        return { value: amounts[0].value, confidence: 0.9 };
      }
    }
  }
  return null;
}

export function extractTotal(text: string): FieldMatch | null {
  // Avoid matching "Subtotal" lines
  const totalPattern = /\b(?:total|amount\s+due|balance\s+due|grand\s+total)\b(?!.*sub)/i;
  return extractLabeledAmount(text, totalPattern);
}

export function extractTax(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:tax|iva|vat|gst|hst)\b/i);
}

export function extractSubtotal(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:sub[\s-]?total)\b/i);
}

// ── Vendor Name ─────────────────────────────────────────────────

const SKIP_LINES = /^(invoice|factura|receipt|recibo|bill|statement|tax|date|page|\d|#|tel|fax|email|phone|www\.|http)/i;

export function extractVendorName(text: string): FieldMatch | null {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);

  for (const line of lines.slice(0, 10)) {
    if (SKIP_LINES.test(line)) continue;
    if (/^\d+$/.test(line)) continue; // skip pure numbers
    if (line.length > 60) continue; // too long for a vendor name

    return { value: line, confidence: 0.7 };
  }

  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/extraction/__tests__/regex-patterns.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/extraction/
git commit -m "feat: add regex-based field extraction patterns with TDD (invoice#, dates, amounts, vendor)"
```

---

## Task 9: Extraction Engine — Confidence Scorer + Field Extractor

**Files:**
- Create: `src/lib/extraction/confidence-scorer.ts`, `src/lib/extraction/field-extractor.ts`
- Test: `src/lib/extraction/__tests__/field-extractor.test.ts`, `src/lib/extraction/__tests__/confidence-scorer.test.ts`

- [ ] **Step 1: Write confidence scorer tests**

Create `src/lib/extraction/__tests__/confidence-scorer.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateOverallConfidence, getConfidenceLevel } from "../confidence-scorer";
import type { ExtractedData } from "@/types/invoice";

describe("calculateOverallConfidence", () => {
  it("averages all field confidences", () => {
    const data: ExtractedData = {
      invoice_number: { value: "123", confidence: 0.9, source: "regex" },
      date: { value: "2025-01-15", confidence: 0.8, source: "regex" },
      total: { value: 100, confidence: 1.0, source: "regex" },
      subtotal: { value: 90, confidence: 0.7, source: "regex" },
      tax: { value: 10, confidence: 0.6, source: "regex" },
      currency: { value: "USD", confidence: 0.9, source: "regex" },
      vendor_name: { value: "Acme", confidence: 0.7, source: "regex" },
    };
    const score = calculateOverallConfidence(data);
    expect(score).toBeCloseTo(0.8, 1);
  });
});

describe("getConfidenceLevel", () => {
  it("returns 'high' for >= 0.7", () => {
    expect(getConfidenceLevel(0.9)).toBe("high");
    expect(getConfidenceLevel(0.7)).toBe("high");
  });

  it("returns 'medium' for 0.4-0.69", () => {
    expect(getConfidenceLevel(0.5)).toBe("medium");
    expect(getConfidenceLevel(0.4)).toBe("medium");
  });

  it("returns 'low' for < 0.4", () => {
    expect(getConfidenceLevel(0.3)).toBe("low");
    expect(getConfidenceLevel(0)).toBe("low");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/extraction/__tests__/confidence-scorer.test.ts
```

- [ ] **Step 3: Implement confidence scorer**

Create `src/lib/extraction/confidence-scorer.ts`:

```typescript
import type { ExtractedData } from "@/types/invoice";

export type ConfidenceLevel = "high" | "medium" | "low";

export function calculateOverallConfidence(data: ExtractedData): number {
  const fields = Object.values(data);
  if (fields.length === 0) return 0;
  const sum = fields.reduce((acc, field) => acc + field.confidence, 0);
  return sum / fields.length;
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}
```

- [ ] **Step 4: Run scorer tests**

```bash
npx vitest run src/lib/extraction/__tests__/confidence-scorer.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Write field-extractor tests**

Create `src/lib/extraction/__tests__/field-extractor.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { extractFields } from "../field-extractor";

const SAMPLE_INVOICE = `ACME CORPORATION
123 Business Street, Suite 100
New York, NY 10001

Invoice #INV-2025-0042
Date: January 15, 2025

Bill To:
John Smith
456 Client Ave

Description         Qty    Price     Amount
Widget A             10    $25.00    $250.00
Widget B              5    $40.00    $200.00

Subtotal: $450.00
Tax (8%): $36.00
Total: $486.00

Payment Due: February 15, 2025
Thank you for your business!`;

describe("extractFields", () => {
  it("extracts all fields from a standard invoice", () => {
    const result = extractFields(SAMPLE_INVOICE);

    expect(result.vendor_name.value).toBe("ACME CORPORATION");
    expect(result.invoice_number.value).toBe("INV-2025-0042");
    expect(result.total.value).toBe(486.0);
    expect(result.subtotal.value).toBe(450.0);
    expect(result.tax.value).toBe(36.0);
    expect(result.currency.value).toBe("USD");
    expect(result.date.confidence).toBeGreaterThan(0);
  });

  it("returns low confidence for sparse text", () => {
    const result = extractFields("Hello world, this is not an invoice.");
    expect(result.invoice_number.confidence).toBe(0);
    expect(result.total.confidence).toBe(0);
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
npx vitest run src/lib/extraction/__tests__/field-extractor.test.ts
```

- [ ] **Step 7: Implement field extractor**

Create `src/lib/extraction/field-extractor.ts`:

```typescript
import type { ExtractedData, ExtractedField, FieldSource } from "@/types/invoice";
import {
  extractInvoiceNumber,
  extractDates,
  extractTotal,
  extractSubtotal,
  extractTax,
  extractCurrency,
  extractVendorName,
} from "./regex-patterns";

function emptyField<T>(defaultValue: T): ExtractedField<T> {
  return { value: defaultValue, confidence: 0, source: "regex" as FieldSource };
}

export function extractFields(rawText: string): ExtractedData {
  // Invoice number
  const invoiceNum = extractInvoiceNumber(rawText);
  const invoice_number: ExtractedField<string> = invoiceNum
    ? { value: String(invoiceNum.value), confidence: invoiceNum.confidence, source: "regex" }
    : emptyField("");

  // Date — take the first (most prominent) date found
  const dates = extractDates(rawText);
  const date: ExtractedField<string> = dates.length > 0
    ? { value: String(dates[0].value), confidence: dates[0].confidence, source: "regex" }
    : emptyField("");

  // Total
  const totalMatch = extractTotal(rawText);
  const total: ExtractedField<number> = totalMatch
    ? { value: Number(totalMatch.value), confidence: totalMatch.confidence, source: "regex" }
    : emptyField(0);

  // Subtotal
  const subtotalMatch = extractSubtotal(rawText);
  const subtotal: ExtractedField<number> = subtotalMatch
    ? { value: Number(subtotalMatch.value), confidence: subtotalMatch.confidence, source: "regex" }
    : emptyField(0);

  // Tax
  const taxMatch = extractTax(rawText);
  const tax: ExtractedField<number> = taxMatch
    ? { value: Number(taxMatch.value), confidence: taxMatch.confidence, source: "regex" }
    : emptyField(0);

  // Currency
  const currencyStr = extractCurrency(rawText);
  const currency: ExtractedField<string> = {
    value: currencyStr,
    confidence: currencyStr !== "USD" ? 0.9 : 0.7, // explicit currency mention = higher confidence
    source: "regex",
  };

  // Vendor name
  const vendorMatch = extractVendorName(rawText);
  const vendor_name: ExtractedField<string> = vendorMatch
    ? { value: String(vendorMatch.value), confidence: vendorMatch.confidence, source: "regex" }
    : emptyField("");

  return { invoice_number, date, total, subtotal, tax, currency, vendor_name };
}
```

- [ ] **Step 8: Run all extraction tests**

```bash
npx vitest run src/lib/extraction/
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/extraction/
git commit -m "feat: add field extractor, confidence scorer, and full extraction pipeline with TDD"
```

---

## Task 10: OCR Pipeline (pdf-parse + Tesseract.js)

**Files:**
- Create: `src/lib/ocr/pdf-parser.ts`, `src/lib/ocr/tesseract-worker.ts`, `src/lib/ocr/pipeline.ts`
- Test: `src/lib/ocr/__tests__/pdf-parser.test.ts`, `src/lib/ocr/__tests__/pipeline.test.ts`

- [ ] **Step 1: Write PDF parser tests**

Create `src/lib/ocr/__tests__/pdf-parser.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isTextPdf } from "../pdf-parser";

describe("isTextPdf", () => {
  it("returns true for text with > 50 characters", () => {
    expect(isTextPdf("This is a text-based PDF with more than fifty characters of content inside.")).toBe(true);
  });

  it("returns false for empty text", () => {
    expect(isTextPdf("")).toBe(false);
  });

  it("returns false for text under 50 characters", () => {
    expect(isTextPdf("Short")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isTextPdf(null as any)).toBe(false);
    expect(isTextPdf(undefined as any)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/ocr/__tests__/pdf-parser.test.ts
```

- [ ] **Step 3: Implement PDF parser**

Create `src/lib/ocr/pdf-parser.ts`:

```typescript
import pdfParse from "pdf-parse";

export const TEXT_THRESHOLD = 50;

export function isTextPdf(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.trim().length >= TEXT_THRESHOLD;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const result = await pdfParse(buffer);
  return {
    text: result.text,
    numPages: result.numpages,
  };
}
```

- [ ] **Step 4: Run pdf-parser tests**

```bash
npx vitest run src/lib/ocr/__tests__/pdf-parser.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Implement Tesseract worker**

Create `src/lib/ocr/tesseract-worker.ts`:

```typescript
import Tesseract from "tesseract.js";

export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng+spa", {
    logger: () => {}, // suppress logs in production
  });
  return text;
}
```

- [ ] **Step 6: Implement OCR pipeline orchestrator**

Create `src/lib/ocr/pipeline.ts`:

```typescript
import { extractTextFromPdf, isTextPdf } from "./pdf-parser";
import { ocrImage } from "./tesseract-worker";
import { isPdf, isImage } from "@/lib/utils/file-validators";

export interface OcrResult {
  text: string;
  method: "pdf-parse" | "tesseract";
  processingTimeMs: number;
}

export async function processDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<OcrResult> {
  const start = Date.now();

  if (isPdf(mimeType)) {
    // Try text extraction first
    const { text, numPages } = await extractTextFromPdf(buffer);

    if (isTextPdf(text)) {
      return {
        text,
        method: "pdf-parse",
        processingTimeMs: Date.now() - start,
      };
    }

    // Scanned PDF — limit to single page for MVP
    if (numPages > 1) {
      throw new Error(
        "Scanned PDFs are limited to 1 page. Please split or use a text-based PDF."
      );
    }

    // For single-page scanned PDFs, OCR the buffer directly
    // In production, pdf2pic would convert to image first
    const ocrText = await ocrImage(buffer);
    return {
      text: ocrText,
      method: "tesseract",
      processingTimeMs: Date.now() - start,
    };
  }

  if (isImage(mimeType)) {
    const text = await ocrImage(buffer);
    return {
      text,
      method: "tesseract",
      processingTimeMs: Date.now() - start,
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
```

- [ ] **Step 7: Write pipeline integration test**

Create `src/lib/ocr/__tests__/pipeline.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock the heavy dependencies
vi.mock("pdf-parse", () => ({
  default: vi.fn().mockResolvedValue({ text: "Invoice #123\nTotal: $500.00\nACME Corp", numpages: 1 }),
}));

vi.mock("tesseract.js", () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({ data: { text: "OCR extracted text" } }),
  },
}));

import { processDocument } from "../pipeline";

describe("processDocument", () => {
  it("uses pdf-parse for text-based PDFs", async () => {
    const buffer = Buffer.from("fake pdf content");
    const result = await processDocument(buffer, "application/pdf", "test.pdf");

    expect(result.method).toBe("pdf-parse");
    expect(result.text).toContain("Invoice #123");
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("uses tesseract for images", async () => {
    const buffer = Buffer.from("fake image content");
    const result = await processDocument(buffer, "image/png", "test.png");

    expect(result.method).toBe("tesseract");
    expect(result.text).toBe("OCR extracted text");
  });

  it("rejects unsupported file types", async () => {
    const buffer = Buffer.from("fake content");
    await expect(
      processDocument(buffer, "text/plain", "test.txt")
    ).rejects.toThrow("Unsupported file type");
  });
});
```

- [ ] **Step 8: Run all OCR tests**

```bash
npx vitest run src/lib/ocr/
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/ocr/
git commit -m "feat: add OCR pipeline (pdf-parse + Tesseract.js) with text/scanned detection"
```

---

## Task 11: Duplicate Detection

**Files:**
- Create: `src/lib/duplicate/hash-generator.ts`, `src/lib/duplicate/similarity-matcher.ts`
- Test: `src/lib/duplicate/__tests__/hash-generator.test.ts`, `src/lib/duplicate/__tests__/similarity-matcher.test.ts`

- [ ] **Step 1: Write hash generator tests**

Create `src/lib/duplicate/__tests__/hash-generator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generateFileHash } from "../hash-generator";

describe("generateFileHash", () => {
  it("generates consistent SHA-256 hash for same content", async () => {
    const buffer = Buffer.from("test invoice content");
    const hash1 = await generateFileHash(buffer);
    const hash2 = await generateFileHash(buffer);
    expect(hash1).toBe(hash2);
  });

  it("generates different hashes for different content", async () => {
    const hash1 = await generateFileHash(Buffer.from("invoice A"));
    const hash2 = await generateFileHash(Buffer.from("invoice B"));
    expect(hash1).not.toBe(hash2);
  });

  it("returns a 64-character hex string", async () => {
    const hash = await generateFileHash(Buffer.from("test"));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

- [ ] **Step 2: Run to verify fail, then implement**

Create `src/lib/duplicate/hash-generator.ts`:

```typescript
import { createHash } from "crypto";

export async function generateFileHash(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("hex");
}
```

- [ ] **Step 3: Write similarity matcher tests**

Create `src/lib/duplicate/__tests__/similarity-matcher.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isFuzzyDuplicate } from "../similarity-matcher";

describe("isFuzzyDuplicate", () => {
  it("detects same vendor + amount + same date", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-15" }
      )
    ).toBe(true);
  });

  it("detects same vendor + amount + date within 1 day", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-16" }
      )
    ).toBe(true);
  });

  it("rejects different vendor", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Other Corp", amount: 500, date: "2025-01-15" }
      )
    ).toBe(false);
  });

  it("rejects different amount", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 600, date: "2025-01-15" }
      )
    ).toBe(false);
  });

  it("rejects dates more than 1 day apart", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-20" }
      )
    ).toBe(false);
  });
});
```

- [ ] **Step 4: Implement similarity matcher**

Create `src/lib/duplicate/similarity-matcher.ts`:

```typescript
interface InvoiceSignature {
  vendor: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
}

export function isFuzzyDuplicate(a: InvoiceSignature, b: InvoiceSignature): boolean {
  // Vendor must match (case-insensitive)
  if (a.vendor.toLowerCase().trim() !== b.vendor.toLowerCase().trim()) return false;

  // Amount must match exactly
  if (a.amount !== b.amount) return false;

  // Date must be within 1 day
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 1;
}
```

- [ ] **Step 5: Run all duplicate tests**

```bash
npx vitest run src/lib/duplicate/
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/duplicate/
git commit -m "feat: add duplicate detection (SHA-256 hash + fuzzy vendor/amount/date matching)"
```

---

## Task 12: API Routes — Invoice Upload & Processing

**Files:**
- Create: `src/app/api/invoices/upload/route.ts`, `src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`, `src/app/api/invoices/export/route.ts`

- [ ] **Step 1: Create invoice upload API route**

Create `src/app/api/invoices/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateFileType, validateFileSize } from "@/lib/utils/file-validators";
import { generateFileHash } from "@/lib/duplicate/hash-generator";
import { isFuzzyDuplicate } from "@/lib/duplicate/similarity-matcher";
import { processDocument } from "@/lib/ocr/pipeline";
import { extractFields } from "@/lib/extraction/field-extractor";
import { calculateOverallConfidence } from "@/lib/extraction/confidence-scorer";
import { getVendorPattern } from "@/lib/vendor-learning/pattern-store";
import { applyVendorPatterns } from "@/lib/vendor-learning/pattern-matcher";
import { getPlanLimits } from "@/lib/stripe/plans";
import type { Plan } from "@/types/user";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get profile for usage limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, invoice_count_this_month")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check usage limits
  const limits = getPlanLimits(profile.plan as Plan);
  if (profile.invoice_count_this_month >= limits.invoices_per_month) {
    return NextResponse.json(
      { error: "Monthly invoice limit reached. Please upgrade your plan." },
      { status: 429 }
    );
  }

  // Parse multipart form
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file
  if (!validateFileType(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, PNG, JPG, WEBP files are allowed" },
      { status: 400 }
    );
  }

  if (!validateFileSize(file.size)) {
    return NextResponse.json(
      { error: "File exceeds 10MB limit" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Check for exact duplicate (hash)
  const fileHash = await generateFileHash(buffer);
  const { data: existingDuplicate } = await supabase
    .from("invoices")
    .select("id")
    .eq("user_id", user.id)
    .eq("file_hash", fileHash)
    .limit(1)
    .single();

  if (existingDuplicate) {
    return NextResponse.json(
      { error: "This invoice has already been uploaded", duplicate_id: existingDuplicate.id },
      { status: 409 }
    );
  }

  // Create invoice record
  const invoiceId = crypto.randomUUID();
  const storagePath = `${user.id}/${invoiceId}/${file.name}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("invoices")
    .getPublicUrl(storagePath);

  // Create invoice record with 'processing' status
  const { error: insertError } = await supabase.from("invoices").insert({
    id: invoiceId,
    user_id: user.id,
    file_url: storagePath,
    file_name: file.name,
    file_hash: fileHash,
    status: "processing",
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create invoice record" }, { status: 500 });
  }

  // Process document (OCR + extraction)
  try {
    const ocrResult = await processDocument(buffer, file.type, file.name);
    let extractedData = extractFields(ocrResult.text);

    // Apply vendor patterns if user has Pro/Business and vendor is recognized
    if (limits.can_use_vendor_learning && extractedData.vendor_name.value) {
      const vendorPattern = await getVendorPattern(supabase, user.id, extractedData.vendor_name.value);
      if (vendorPattern) {
        extractedData = applyVendorPatterns(ocrResult.text, vendorPattern, extractedData);
      }
    }

    const confidenceScore = calculateOverallConfidence(extractedData);

    // Check for fuzzy duplicates
    let duplicateOf: string | null = null;
    if (extractedData.vendor_name.value && extractedData.total.value && extractedData.date.value) {
      const { data: recentInvoices } = await supabase
        .from("invoices")
        .select("id, vendor_name, total_amount, invoice_date")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .limit(50);

      const fuzzyMatch = recentInvoices?.find((inv) =>
        inv.vendor_name && inv.total_amount != null && inv.invoice_date &&
        isFuzzyDuplicate(
          { vendor: extractedData.vendor_name.value, amount: extractedData.total.value, date: extractedData.date.value },
          { vendor: inv.vendor_name, amount: inv.total_amount, date: inv.invoice_date }
        )
      );
      if (fuzzyMatch) duplicateOf = fuzzyMatch.id;
    }

    // Update invoice with extracted data + sync denormalized columns
    await supabase
      .from("invoices")
      .update({
        status: "completed",
        raw_text: ocrResult.text,
        extracted_data: extractedData,
        vendor_name: extractedData.vendor_name.value || null,
        invoice_number: extractedData.invoice_number.value || null,
        invoice_date: extractedData.date.value || null,
        total_amount: extractedData.total.value || null,
        currency: extractedData.currency.value || null,
        tax_amount: extractedData.tax.value || null,
        subtotal_amount: extractedData.subtotal.value || null,
        confidence_score: confidenceScore,
        duplicate_of: duplicateOf,
      })
      .eq("id", invoiceId);

    // Increment monthly counter
    await supabase.rpc("increment_invoice_count", { user_id_param: user.id });

    return NextResponse.json({
      id: invoiceId,
      status: "completed",
      confidence_score: confidenceScore,
      extracted_data: extractedData,
      duplicate_of: duplicateOf,
    });
  } catch (err) {
    // Update status to failed
    await supabase
      .from("invoices")
      .update({ status: "failed" })
      .eq("id", invoiceId);

    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ id: invoiceId, status: "failed", error: message }, { status: 422 });
  }
}
```

- [ ] **Step 2: Create invoice list API route**

Create `src/app/api/invoices/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const sortBy = searchParams.get("sort_by") ?? "created_at";
  const sortOrder = searchParams.get("sort_order") === "asc" ? true : false;
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const vendorName = searchParams.get("vendor_name");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const amountMin = searchParams.get("amount_min");
  const amountMax = searchParams.get("amount_max");
  const q = searchParams.get("q");

  const offset = (page - 1) * limit;

  let query = supabase
    .from("invoices")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order(sortBy, { ascending: sortOrder })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (vendorName) query = query.ilike("vendor_name", `%${vendorName}%`);
  if (dateFrom) query = query.gte("invoice_date", dateFrom);
  if (dateTo) query = query.lte("invoice_date", dateTo);
  if (amountMin) query = query.gte("total_amount", parseFloat(amountMin));
  if (amountMax) query = query.lte("total_amount", parseFloat(amountMax));
  if (q) {
    query = query.or(`vendor_name.ilike.%${q}%,invoice_number.ilike.%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  });
}
```

- [ ] **Step 4: Create invoice detail/edit/delete API route**

Create `src/app/api/invoices/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { field_name, value } = body;

  if (!field_name || value === undefined) {
    return NextResponse.json({ error: "field_name and value required" }, { status: 400 });
  }

  const { error } = await supabase.rpc("update_invoice_field", {
    p_invoice_id: id,
    p_field_name: field_name,
    p_value: String(value),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch updated invoice
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get file path for storage cleanup
  const { data: invoice } = await supabase
    .from("invoices")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Delete from storage
  await supabase.storage.from("invoices").remove([invoice.file_url]);

  // Delete from database
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create export API route**

Create `src/app/api/invoices/export/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/stripe/plans";
import type { Plan } from "@/types/user";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = new URL(request.url).searchParams.get("format") ?? "csv";

  // Check plan for JSON export
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profile?.plan ?? "free") as Plan);
  if (format === "json" && !limits.can_export_json) {
    return NextResponse.json(
      { error: "JSON export requires Pro or Business plan" },
      { status: 403 }
    );
  }

  // Fetch all completed invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ error: "No invoices to export" }, { status: 404 });
  }

  if (format === "json") {
    const exportData = invoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      vendor_name: inv.vendor_name,
      invoice_date: inv.invoice_date,
      total_amount: inv.total_amount,
      currency: inv.currency,
      tax_amount: inv.tax_amount,
      subtotal_amount: inv.subtotal_amount,
      category: inv.category,
      file_name: inv.file_name,
      confidence_score: inv.confidence_score,
      created_at: inv.created_at,
    }));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mirqolyzer-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  // CSV export
  const headers = ["Invoice Number", "Vendor", "Date", "Total", "Currency", "Tax", "Subtotal", "Category", "File", "Confidence", "Uploaded"];
  const rows = invoices.map((inv) =>
    [
      inv.invoice_number ?? "",
      inv.vendor_name ?? "",
      inv.invoice_date ?? "",
      inv.total_amount ?? "",
      inv.currency ?? "",
      inv.tax_amount ?? "",
      inv.subtotal_amount ?? "",
      inv.category ?? "",
      inv.file_name,
      inv.confidence_score?.toFixed(2) ?? "",
      inv.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="mirqolyzer-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/ supabase/
git commit -m "feat: add API routes for invoice upload, list, detail, edit, delete, and export"
```

---

## Task 13: Stripe API Routes (Checkout + Webhook + Portal)

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`, `src/app/api/stripe/portal/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/stripe/webhooks.ts`

- [ ] **Step 1: Create Stripe checkout route**

Create `src/app/api/stripe/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import type { Plan } from "@/types/user";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json() as { plan: Plan };
  const planConfig = PLANS.find((p) => p.plan === plan);

  if (!planConfig || !planConfig.stripe_price_id) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    metadata: { supabase_user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Create Stripe portal route**

Create `src/app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 3: Create Stripe webhook handler**

Create `src/lib/stripe/webhooks.ts`:

```typescript
import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPlanByPriceId } from "./plans";

// Use service role for webhook processing (no user context)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan;

  if (!userId || !plan) return;

  const supabase = getAdminClient();
  await supabase
    .from("profiles")
    .update({ plan, stripe_customer_id: session.customer as string })
    .eq("id", userId);
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;

  if (!priceId) return;

  const plan = getPlanByPriceId(priceId);
  if (!plan) return;

  await supabase
    .from("profiles")
    .update({ plan })
    .eq("stripe_customer_id", customerId);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const customerId = subscription.customer as string;

  await supabase
    .from("profiles")
    .update({ plan: "free" })
    .eq("stripe_customer_id", customerId);
}
```

- [ ] **Step 4: Create webhook route**

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "@/lib/stripe/webhooks";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/stripe/ src/app/api/webhooks/ src/lib/stripe/webhooks.ts
git commit -m "feat: add Stripe checkout, portal, and webhook routes with plan management"
```

---

## Task 14: Dashboard Layout (Sidebar + Header)

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`, `src/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Create sidebar component**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/user";
import { getPlanLimits } from "@/lib/stripe/plans";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const limits = getPlanLimits(profile.plan);
  const usagePercent = Math.min(
    100,
    (profile.invoice_count_this_month / limits.invoices_per_month) * 100
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="text-xl">
          <span className="font-bold text-foreground">Mirqo</span>
          <span className="font-light text-muted-foreground">lyzer</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Usage meter */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">
          {profile.invoice_count_this_month} / {limits.invoices_per_month} invoices this month
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              usagePercent >= 90 ? "bg-destructive" : usagePercent >= 70 ? "bg-yellow-500" : "bg-success"
            )}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground capitalize">{profile.plan} plan</div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create header component**

Create `src/components/layout/header.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Menu } from "lucide-react";
import type { Profile } from "@/types/user";

interface HeaderProps {
  profile: Profile;
  onMenuClick?: () => void;
}

export function Header({ profile, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground lg:hidden">
          <span className="font-bold">Mirqo</span>
          <span className="font-light">lyzer</span>
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm">{profile.full_name || "Account"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

- [ ] **Step 3: Create mobile nav**

Create `src/components/layout/mobile-nav.tsx`:

```tsx
"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { Profile } from "@/types/user";

interface MobileNavProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ profile, open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar profile={profile} />
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Create dashboard layout**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
```

Create `src/app/(dashboard)/dashboard-shell.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Profile } from "@/types/user";

export function DashboardShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar profile={profile} />
      <MobileNav profile={profile} open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create dashboard page placeholder**

Create `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <p className="text-muted-foreground">Upload an invoice to get started.</p>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/layout/
git commit -m "feat: add dashboard layout with sidebar, header, mobile nav, and auth protection"
```

---

## Task 15: Invoice Uploader Component

**Files:**
- Create: `src/components/invoices/invoice-uploader.tsx`

- [ ] **Step 1: Create InvoiceUploader component**

Create `src/components/invoices/invoice-uploader.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { validateFileType, validateFileSize, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/utils/file-validators";

interface UploadState {
  status: "idle" | "validating" | "uploading" | "processing" | "done" | "error";
  progress: number;
  error?: string;
  duplicateId?: string;
}

export function InvoiceUploader() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle", progress: 0 });
  const router = useRouter();

  const handleFile = useCallback(async (file: File) => {
    setUploadState({ status: "validating", progress: 10 });

    if (!validateFileType(file.type)) {
      setUploadState({ status: "error", progress: 0, error: "Only PDF, PNG, JPG, WEBP files are allowed" });
      return;
    }

    if (!validateFileSize(file.size)) {
      setUploadState({ status: "error", progress: 0, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` });
      return;
    }

    setUploadState({ status: "uploading", progress: 30 });

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadState({ status: "processing", progress: 60 });

      const res = await fetch("/api/invoices/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setUploadState({
            status: "error",
            progress: 0,
            error: data.error,
            duplicateId: data.duplicate_id,
          });
          return;
        }
        throw new Error(data.error || "Upload failed");
      }

      setUploadState({ status: "done", progress: 100 });

      // Navigate to the processed invoice
      setTimeout(() => {
        router.push(`/dashboard/invoices/${data.id}`);
        router.refresh();
      }, 500);
    } catch (err) {
      setUploadState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, [router]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const isProcessing = ["validating", "uploading", "processing"].includes(uploadState.status);

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-colors p-8",
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        uploadState.status === "error" && "border-destructive/50 bg-destructive/5"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center gap-4">
        {isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploadState.status === "validating" && "Validating file..."}
                {uploadState.status === "uploading" && "Uploading..."}
                {uploadState.status === "processing" && "Extracting invoice data..."}
              </p>
              <div className="h-2 w-48 bg-muted rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          </>
        ) : uploadState.status === "error" ? (
          <>
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-2">
              <p className="text-sm text-destructive">{uploadState.error}</p>
              {uploadState.duplicateId && (
                <Button variant="link" size="sm" onClick={() => router.push(`/dashboard/invoices/${uploadState.duplicateId}`)}>
                  View existing invoice
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setUploadState({ status: "idle", progress: 0 })}>
                Try again
              </Button>
            </div>
          </>
        ) : uploadState.status === "done" ? (
          <>
            <FileText className="h-10 w-10 text-success" />
            <p className="text-sm text-success font-medium">Invoice processed successfully!</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop your invoice here, or{" "}
                <label className="text-primary cursor-pointer hover:underline">
                  browse
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileInput} />
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/invoices/invoice-uploader.tsx
git commit -m "feat: add drag & drop invoice uploader with progress, validation, and duplicate detection"
```

---

## Task 16: Dashboard Page (Stats + Recent Invoices + Upload)

**Files:**
- Create: `src/components/dashboard/stats.tsx`, `src/components/dashboard/recent-invoices.tsx`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create stats component**

Create `src/components/dashboard/stats.tsx`:

```tsx
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";

interface StatsProps {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalAmount: number;
  currency: string;
}

export function Stats({ total, completed, processing, failed, totalAmount, currency }: StatsProps) {
  const items = [
    { label: "Total Invoices", value: total, icon: FileText, color: "text-primary" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-success" },
    { label: "Processing", value: processing, icon: Clock, color: "text-yellow-500" },
    { label: "Total Value", value: formatCurrency(totalAmount, currency), icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create recent invoices component**

Create `src/components/dashboard/recent-invoices.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeDate } from "@/lib/utils/date-helpers";
import type { Invoice } from "@/types/invoice";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-success/10 text-success",
  processing: "bg-yellow-500/10 text-yellow-600",
  failed: "bg-destructive/10 text-destructive",
  uploading: "bg-muted text-muted-foreground",
};

export function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No invoices yet. Upload one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/invoices/${invoice.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {invoice.vendor_name || invoice.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.invoice_number && `#${invoice.invoice_number} · `}
                  {formatRelativeDate(invoice.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {invoice.total_amount != null && (
                  <span className="text-sm font-medium">
                    {formatCurrency(invoice.total_amount, invoice.currency ?? "USD")}
                  </span>
                )}
                <Badge variant="secondary" className={STATUS_COLORS[invoice.status]}>
                  {invoice.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Update dashboard page with real data**

Replace `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Stats } from "@/components/dashboard/stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { InvoiceUploader } from "@/components/invoices/invoice-uploader";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch invoices for stats
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const all = invoices ?? [];
  const completed = all.filter((i) => i.status === "completed");
  const totalAmount = completed.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <Stats
        total={all.length}
        completed={completed.length}
        processing={all.filter((i) => i.status === "processing").length}
        failed={all.filter((i) => i.status === "failed").length}
        totalAmount={totalAmount}
        currency="USD"
      />

      <InvoiceUploader />

      <RecentInvoices invoices={all.slice(0, 10)} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ src/app/\(dashboard\)/dashboard/ src/components/invoices/
git commit -m "feat: add dashboard page with stats, upload zone, and recent invoices"
```

---

## Task 17: Invoice Detail Page (Extraction View + Field Editor)

**Files:**
- Create: `src/app/(dashboard)/invoices/[id]/page.tsx`, `src/components/invoices/extraction-view.tsx`, `src/components/invoices/field-editor.tsx`

- [ ] **Step 1: Create field editor component**

Create `src/components/invoices/field-editor.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getConfidenceLevel } from "@/lib/extraction/confidence-scorer";

interface FieldEditorProps {
  label: string;
  value: string | number;
  confidence: number;
  fieldName: string;
  invoiceId: string;
  onUpdate: (fieldName: string, value: string) => Promise<void>;
}

const CONFIDENCE_STYLES = {
  high: "border-success/30 bg-success/5",
  medium: "border-yellow-500/30 bg-yellow-500/5",
  low: "border-destructive/30 bg-destructive/5",
};

const CONFIDENCE_DOT = {
  high: "bg-success",
  medium: "bg-yellow-500",
  low: "bg-destructive",
};

export function FieldEditor({ label, value, confidence, fieldName, invoiceId, onUpdate }: FieldEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [saving, setSaving] = useState(false);

  const level = getConfidenceLevel(confidence);

  async function handleSave() {
    setSaving(true);
    await onUpdate(fieldName, editValue);
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setEditValue(String(value));
    setEditing(false);
  }

  return (
    <div className={cn("rounded-lg border p-3 transition-colors", CONFIDENCE_STYLES[level])}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", CONFIDENCE_DOT[level])} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(confidence * 100)}%</span>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave} disabled={saving}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", !value && "text-muted-foreground italic")}>
            {value || "Not detected"}
          </span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create extraction view component**

Create `src/components/invoices/extraction-view.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { FieldEditor } from "./field-editor";
import type { Invoice } from "@/types/invoice";

interface ExtractionViewProps {
  invoice: Invoice;
}

const FIELD_LABELS: Record<string, string> = {
  vendor_name: "Vendor",
  invoice_number: "Invoice Number",
  date: "Date",
  total: "Total",
  subtotal: "Subtotal",
  tax: "Tax",
  currency: "Currency",
};

export function ExtractionView({ invoice }: ExtractionViewProps) {
  const router = useRouter();
  const data = invoice.extracted_data;

  async function handleFieldUpdate(fieldName: string, value: string) {
    await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_name: fieldName, value }),
    });
    router.refresh();
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No extraction data available.
      </div>
    );
  }

  const fields = Object.entries(data) as [string, { value: string | number; confidence: number }][];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Extracted Fields</h3>
      {fields.map(([key, field]) => (
        <FieldEditor
          key={key}
          label={FIELD_LABELS[key] ?? key}
          value={field.value}
          confidence={field.confidence}
          fieldName={key}
          invoiceId={invoice.id}
          onUpdate={handleFieldUpdate}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create invoice detail page**

Create `src/app/(dashboard)/invoices/[id]/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtractionView } from "@/components/invoices/extraction-view";
import { formatDate } from "@/lib/utils/date-helpers";
import Link from "next/link";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) notFound();

  // Get signed URL for file preview
  const { data: signedUrl } = await supabase.storage
    .from("invoices")
    .createSignedUrl(invoice.file_url, 3600);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold">{invoice.vendor_name || invoice.file_name}</h2>
            <p className="text-sm text-muted-foreground">
              Uploaded {formatDate(invoice.created_at)}
              {invoice.invoice_number && ` · #${invoice.invoice_number}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={invoice.status === "completed" ? "default" : "secondary"}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Side-by-side: document + extraction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original document */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Original Document</CardTitle>
          </CardHeader>
          <CardContent>
            {signedUrl?.signedUrl ? (
              invoice.file_name.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={signedUrl.signedUrl}
                  className="w-full h-[600px] rounded border"
                  title="Invoice PDF"
                />
              ) : (
                <img
                  src={signedUrl.signedUrl}
                  alt="Invoice"
                  className="w-full rounded border object-contain max-h-[600px]"
                />
              )
            ) : (
              <p className="text-muted-foreground text-sm">Document preview not available</p>
            )}
          </CardContent>
        </Card>

        {/* Extracted data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Extracted Data</CardTitle>
            {invoice.confidence_score != null && (
              <p className="text-xs text-muted-foreground">
                Overall confidence: {Math.round(invoice.confidence_score * 100)}%
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ExtractionView invoice={invoice} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/invoices/ src/components/invoices/
git commit -m "feat: add invoice detail page with side-by-side document view and inline field editing"
```

---

## Task 18: Landing Page + Pricing

**Files:**
- Create: `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/app/(marketing)/pricing/page.tsx`
- Create: `src/components/marketing/hero.tsx`, `src/components/marketing/features.tsx`, `src/components/marketing/pricing-section.tsx`, `src/components/marketing/cta.tsx`

- [ ] **Step 1: Create marketing layout**

Create `src/app/(marketing)/layout.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl">
            <span className="font-bold">Mirqo</span>
            <span className="font-light text-muted-foreground">lyzer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-brand-800 hover:bg-brand-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mirqolyzer. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Create Hero, Features, Pricing, CTA components**

Create `src/components/marketing/hero.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-700/30 bg-brand-900/20 text-brand-300 text-xs font-medium mb-6">
          <Zap className="h-3 w-3" /> No AI APIs needed — works offline
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
          Analyze invoices{" "}
          <span className="text-brand-400">in seconds</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload invoices and receipts. Our OCR engine extracts vendor, amounts, dates, and tax data instantly.
          No AI subscription required — everything runs on smart pattern matching.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-brand-800 hover:bg-brand-700 text-base px-8">
              Start Free
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-base px-8">
              View Pricing
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> 5 free invoices/mo</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Bank-grade security</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> No setup required</div>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/marketing/features.tsx`:

```tsx
import { FileSearch, Edit3, Download, Shield, Brain, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  { icon: FileSearch, title: "Smart OCR", desc: "Extract text from PDFs and images using advanced OCR technology." },
  { icon: Edit3, title: "Editable Fields", desc: "Review and correct extracted data with confidence indicators." },
  { icon: Brain, title: "Pattern Learning", desc: "The system learns your vendors' invoice patterns over time." },
  { icon: Copy, title: "Duplicate Detection", desc: "Automatically flags duplicate invoices before they enter your system." },
  { icon: Download, title: "CSV & JSON Export", desc: "Export your invoice data in the format your accounting software needs." },
  { icon: Shield, title: "Secure by Default", desc: "Row-level security ensures your data is always private." },
];

export function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to process invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <Icon className="h-8 w-8 text-brand-400 mb-4" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/marketing/pricing-section.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";

export function PricingSection() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-muted-foreground text-center mb-12">Start free. Upgrade when you need more.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.plan} className={plan.popular ? "border-brand-400 shadow-lg shadow-brand-400/10 relative" : ""}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-800">Most Popular</Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.price === 0 ? "Start Free" : "Get Started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/marketing/cta.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to streamline your invoices?</h2>
        <p className="text-muted-foreground mb-8">Start analyzing invoices in under a minute. No credit card required.</p>
        <Link href="/signup">
          <Button size="lg" className="bg-brand-800 hover:bg-brand-700 text-base px-8">
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create landing page**

Create `src/app/(marketing)/page.tsx`:

```tsx
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTA } from "@/components/marketing/cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <PricingSection />
      <CTA />
    </>
  );
}
```

- [ ] **Step 4: Create pricing page**

Create `src/app/(marketing)/pricing/page.tsx`:

```tsx
import { PricingSection } from "@/components/marketing/pricing-section";

export default function PricingPage() {
  return (
    <div className="py-8">
      <PricingSection />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(marketing\)/ src/components/marketing/
git commit -m "feat: add landing page with hero, features, pricing, and CTA sections"
```

---

## Task 19: Settings & Billing Pages

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`, `src/app/(dashboard)/billing/page.tsx`

- [ ] **Step 1: Create settings page**

Create `src/app/(dashboard)/settings/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setFullName(data.full_name ?? "");
        setCompany(data.company ?? "");
      }
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: fullName, company }).eq("id", user.id);
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create billing page**

Create `src/app/(dashboard)/billing/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PLANS, getPlanLimits } from "@/lib/stripe/plans";
import type { Plan, Profile } from "@/types/user";

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data as Profile);
    }
    load();
  }, [supabase]);

  async function handleUpgrade(plan: Plan) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  async function handleManage() {
    setLoading("manage");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  if (!profile) return null;

  const currentLimits = getPlanLimits(profile.plan);

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold">Billing</h2>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold capitalize">{profile.plan}</p>
            <p className="text-sm text-muted-foreground">
              {profile.invoice_count_this_month} / {currentLimits.invoices_per_month} invoices used this month
            </p>
          </div>
          {profile.stripe_customer_id && (
            <Button variant="outline" onClick={handleManage} disabled={loading === "manage"}>
              {loading === "manage" ? "Loading..." : "Manage Subscription"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <Card key={plan.plan} className={plan.plan === profile.plan ? "border-primary" : ""}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <div>
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.plan === profile.plan ? (
                <Badge className="w-full justify-center">Current Plan</Badge>
              ) : plan.price > 0 ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.plan)}
                  disabled={loading === plan.plan}
                >
                  {loading === plan.plan ? "Loading..." : "Upgrade"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/settings/ src/app/\(dashboard\)/billing/
git commit -m "feat: add settings page (profile edit) and billing page (plan management + Stripe portal)"
```

---

## Task 20: Vendor Pattern Learning

**Files:**
- Create: `src/lib/vendor-learning/pattern-store.ts`, `src/lib/vendor-learning/pattern-matcher.ts`

- [ ] **Step 1: Create pattern store**

Create `src/lib/vendor-learning/pattern-store.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { VendorPattern } from "@/types/extraction";

export async function getVendorPattern(
  supabase: SupabaseClient,
  userId: string,
  vendorName: string
): Promise<VendorPattern | null> {
  const { data } = await supabase
    .from("vendor_patterns")
    .select("*")
    .eq("user_id", userId)
    .eq("vendor_name", vendorName.toLowerCase().trim())
    .single();

  return data as VendorPattern | null;
}

export async function upsertVendorPattern(
  supabase: SupabaseClient,
  userId: string,
  vendorName: string,
  fieldName: string,
  pattern: { regex: string; anchor: string; position: string }
): Promise<void> {
  const normalized = vendorName.toLowerCase().trim();
  const existing = await getVendorPattern(supabase, userId, normalized);

  if (existing) {
    const updatedPatterns = {
      ...existing.field_patterns,
      [fieldName]: pattern,
    };

    await supabase
      .from("vendor_patterns")
      .update({
        field_patterns: updatedPatterns,
        sample_count: existing.sample_count + 1,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("vendor_patterns").insert({
      user_id: userId,
      vendor_name: normalized,
      field_patterns: { [fieldName]: pattern },
      sample_count: 1,
    });
  }
}
```

- [ ] **Step 2: Create pattern matcher**

Create `src/lib/vendor-learning/pattern-matcher.ts`:

```typescript
import type { ExtractedData, ExtractedField } from "@/types/invoice";
import type { VendorPattern } from "@/types/extraction";

export function applyVendorPatterns(
  rawText: string,
  pattern: VendorPattern,
  baseExtraction: ExtractedData
): ExtractedData {
  const result = { ...baseExtraction };

  for (const [fieldName, fieldPattern] of Object.entries(pattern.field_patterns)) {
    if (!(fieldName in result)) continue;

    try {
      const regex = new RegExp(fieldPattern.regex, "i");
      const match = rawText.match(regex);

      if (match?.[1]) {
        const confidenceBoost = Math.min(0.15, pattern.sample_count * 0.03);
        const key = fieldName as keyof ExtractedData;

        (result[key] as ExtractedField<string | number>) = {
          value: match[1].trim() as any,
          confidence: Math.min(1, 0.85 + confidenceBoost),
          source: "vendor_pattern",
        };
      }
    } catch {
      // Invalid regex — skip
    }
  }

  return result;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/vendor-learning/
git commit -m "feat: add vendor pattern learning (store corrections + apply on next upload)"
```

---

## Task 21: Dark Mode + Theme Toggle

**Files:**
- Create: `src/components/layout/theme-provider.tsx`, `src/components/layout/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create theme provider**

(next-themes already installed in Task 1 Step 2)

Create `src/components/layout/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Create theme toggle**

Create `src/components/layout/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

- [ ] **Step 4: Wrap app in ThemeProvider**

Update `src/app/layout.tsx` to include ThemeProvider:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirqolyzer — Analyze invoices in seconds",
  description: "Upload invoices and receipts. Our OCR engine extracts vendor, amounts, dates, and tax data instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Add ThemeToggle to header component**

Add the ThemeToggle to `src/components/layout/header.tsx` next to the user dropdown.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/theme-provider.tsx src/components/layout/theme-toggle.tsx src/app/layout.tsx src/components/layout/header.tsx
git commit -m "feat: add dark mode with next-themes and theme toggle in header"
```

---

## Task 22: Run All Tests & Final Build

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: successful build with no errors.

- [ ] **Step 3: Fix any test failures or build errors**

If any failures, fix them before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix any remaining build/test issues for MVP"
```

---

## Task 23: Create CLAUDE.md for Mirqolyzer

- [ ] **Step 1: Create project CLAUDE.md**

Create `CLAUDE.md` in project root with commands, architecture, and conventions documentation for future development sessions.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project conventions and architecture guide"
```
