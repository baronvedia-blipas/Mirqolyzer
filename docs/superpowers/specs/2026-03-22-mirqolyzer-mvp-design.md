# Mirqolyzer MVP — Design Specification

**Date:** 2026-03-22
**Status:** Approved
**Author:** Brainstorming session

---

## 1. Product Overview

Mirqolyzer is a SaaS invoice analyzer for SMBs and accountants. Users upload invoices/receipts (PDF, images) and a rule-based OCR pipeline extracts structured data — no LLM/AI APIs. The architecture is designed so an AI layer can be added later as an upgrade path.

**Tagline:** "Analyze invoices in seconds"

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| OCR | Tesseract.js (server-side for images), pdf-parse (text PDFs), pdf2pic (scanned PDFs) |
| Database | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Payments | Stripe Checkout + Webhooks + Customer Portal |
| Deployment | Vercel |
| Testing | Vitest + Playwright |

---

## 3. Architecture

### 3.1 OCR Pipeline (Server-Side Orchestrated — Approach A)

All processing in Next.js API routes:

```
Upload → API Route → detect file type
  ├─ Text PDF → pdf-parse (instant, ~100ms)
  ├─ Scanned PDF → pdf2pic → Tesseract.js server worker (5-15s)
  └─ Image → Tesseract.js server worker (5-15s)
       ↓
  Vendor Pattern Check (apply learned patterns if vendor recognized)
       ↓
  Field Extraction (regex + heuristics)
       ↓
  Confidence Scoring → Save to DB → Update invoice status
```

**Scanned PDF detection:** Run `pdf-parse` first. If extracted text is empty or < 50 characters, treat as scanned and route to Tesseract.js.

**Timeout strategy:** MVP limits scanned PDFs to single-page only. Multi-page scanned PDFs are rejected with a user-friendly message ("Scanned PDFs are limited to 1 page. Please split or use a text-based PDF."). Text-based PDFs have no page limit (pdf-parse is instant). This keeps processing well under Vercel's 60s Pro timeout. Background job processing (Inngest/Trigger.dev) is the Phase 2 path for multi-page scanned docs.

### 3.2 Field Extraction Layer

Regex + heuristic patterns for:
- **invoice_number**: "Invoice #", "Inv.", "No.", "Factura" + alphanumeric
- **dates**: DD/MM/YYYY, MM-DD-YYYY, "Jan 15, 2025", ISO 8601
- **amounts**: $1,234.56, EUR 1.234,56, MXN, USD patterns
- **vendor_name**: first prominent text block or text near logo area
- **tax**: "Tax", "IVA", "VAT", "GST" + nearby amount
- **total**: "Total", "Amount Due", "Balance Due" + largest amount
- **subtotal**: "Subtotal", "Sub-total" + amount

### 3.3 Confidence Scoring

Each extracted field gets a score (0-1):
- Strong regex match with clear anchor text: 0.9-1.0
- Regex match but ambiguous context: 0.7-0.89
- Weak/partial match: 0.4-0.69
- No match: 0

UI treatment:
- >= 0.7 confidence: green (accepted)
- 0.4-0.69: yellow (needs review)
- < 0.4 or missing: red (manual entry required)

### 3.4 Vendor Learning

When user corrects a field:
1. Store the vendor name + field patterns in `vendor_patterns`
2. Increment `sample_count`
3. On next upload from same vendor, apply stored patterns before generic regex
4. Higher sample_count = higher confidence boost

---

## 4. Database Schema

### 4.1 Tables

**profiles**
- id: uuid (PK, references auth.users — this IS the user_id)
- full_name: text
- company: text nullable
- plan: text ('free' | 'pro' | 'business'), default 'free'
- invoice_count_this_month: int, default 0
- stripe_customer_id: text nullable
- created_at: timestamptz
- updated_at: timestamptz

**invoices**
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- file_url: text
- file_name: text
- file_hash: text (SHA-256 for duplicate detection)
- status: text ('uploading' | 'processing' | 'completed' | 'failed')
- raw_text: text nullable
- extracted_data: jsonb (typed structure, see below)
- vendor_name: text nullable (denormalized for search/filter)
- invoice_number: text nullable (denormalized)
- invoice_date: date nullable (denormalized)
- total_amount: numeric nullable (denormalized)
- currency: text nullable (denormalized)
- tax_amount: numeric nullable (denormalized)
- subtotal_amount: numeric nullable (denormalized)
- category: text nullable
- confidence_score: float nullable (average across fields)
- duplicate_of: uuid nullable (FK → invoices)
- created_at: timestamptz
- updated_at: timestamptz

**extracted_data JSONB structure:**
```typescript
{
  invoice_number: { value: string, confidence: number, source: "regex" | "vendor_pattern" },
  date: { value: string, confidence: number, source: "regex" | "vendor_pattern" },
  total: { value: number, confidence: number, source: "regex" | "vendor_pattern" },
  subtotal: { value: number, confidence: number, source: "regex" | "vendor_pattern" },
  tax: { value: number, confidence: number, source: "regex" | "vendor_pattern" },
  currency: { value: string, confidence: number, source: "regex" | "vendor_pattern" },
  vendor_name: { value: string, confidence: number, source: "regex" | "vendor_pattern" }
}
```

**line_items** — DEFERRED TO PHASE 2. Line item extraction from OCR text requires table detection which is significantly harder than header-level field extraction. For MVP, line items can be manually added by users. The table schema is kept for forward compatibility but no automated parsing is built.
- id: uuid (PK)
- invoice_id: uuid (FK → invoices)
- description: text
- quantity: numeric nullable
- unit_price: numeric nullable
- total: numeric
- category: text nullable

**vendor_patterns**
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- vendor_name: text
- field_patterns: jsonb
- sample_count: int, default 1
- created_at: timestamptz
- updated_at: timestamptz

**usage_logs** — DEFERRED TO PHASE 2. No consumer in MVP. Will be added when analytics dashboard is built.

### 4.2 RLS Policies

- **profiles**: `auth.uid() = id` for all operations. Auto-created via DB trigger on auth.users insert.
- **invoices, line_items, vendor_patterns, usage_logs**: `auth.uid() = user_id` for all operations.

### 4.3 Source of Truth & Edit Sync

`extracted_data` JSONB is the **source of truth** for all field values + metadata (confidence, source). The denormalized top-level columns (`vendor_name`, `total_amount`, etc.) are **derived indexes** for search/filter/sort.

When a user edits a field via FieldEditor:
1. Update the field in `extracted_data` JSONB (set confidence to 1.0, source to "manual")
2. Sync the denormalized column to match
3. If vendor learning is enabled (Pro/Business), update `vendor_patterns`

Both writes happen in a single transaction via Supabase RPC function.

### 4.3 Storage

Bucket: `invoices` (private, RLS enforced, max 10MB)
Path pattern: `{user_id}/{invoice_id}/{original_filename}`

### 4.5 Migrations

SQL migration files checked into `supabase/migrations/` directory. Run via Supabase CLI (`supabase db push`) or manually in the SQL Editor. Seed data for development in `supabase/seed.sql`.

---

## 5. Auth Flow

```
Sign Up → Supabase Auth (email/password or Google OAuth)
       → DB trigger creates profile (plan: 'free', count: 0)
       → Redirect to /dashboard

Login → Supabase Auth → JWT in cookie (SSR-compatible via @supabase/ssr)
     → Next.js middleware validates session on /dashboard/* routes
     → No session → redirect /login

OAuth callback → /auth/callback route
```

---

## 6. Stripe Billing

### 6.1 Plans

| | Free | Pro ($29/mo) | Business ($59/mo) |
|---|---|---|---|
| Invoices/month | 5 | 50 | 500 |
| Export | CSV only | CSV + JSON | CSV + JSON |
| Vendor learning | No | Yes | Yes |
| Priority support | No | No | Yes |

### 6.2 Flow

```
Upgrade click → POST /api/stripe/checkout → Stripe Checkout Session
  → Redirect to Stripe → Payment → Webhook fires
  → /api/webhooks/stripe → update profile.plan + stripe_customer_id
  → User returns to /dashboard

Manage → POST /api/stripe/portal → Stripe Customer Portal
```

### 6.3 Usage Limits

- Check `profile.invoice_count_this_month` vs plan limit on every upload
- Monthly reset via Supabase pg_cron on the 1st
- At limit → show upgrade prompt, block upload

---

## 7. Duplicate Detection

Two-layer approach:
1. **Hash-based**: SHA-256 of file content. Exact match = definite duplicate.
2. **Fuzzy matching**: Same vendor + amount + date within +/-1 day = probable duplicate. Flag but allow override.

---

## 8. UI/UX Design

### 8.1 Branding
- Colors: Deep blue primary (#1e3a5f), accent green (#22c55e) for success
- Font: Inter (sans-serif)
- Style: Clean SaaS aesthetic, subtle glassmorphism on cards
- Dark/light mode via CSS custom properties
- Wordmark: "Mirqo" bold + "lyzer" light weight

### 8.2 Pages

**Marketing (public):**
- `/` — Landing page (Hero, Features, Pricing, CTA)
- `/pricing` — Detailed pricing comparison

**Auth:**
- `/login` — Email/password + Google OAuth
- `/signup` — Registration
- `/auth/callback` — OAuth redirect handler

**Dashboard (protected):**
- `/dashboard` — Stats, recent invoices, category chart
- `/dashboard/invoices/[id]` — Side-by-side: original doc + extracted data (editable)
- `/dashboard/settings` — Profile, preferences
- `/dashboard/billing` — Plan management, Stripe portal

### 8.3 Key Components
- **InvoiceUploader**: Drag & drop zone, file validation, progress indicator
- **ExtractionView**: Side-by-side original + extracted fields with confidence colors
- **FieldEditor**: Inline editing with save → vendor learning trigger
- **Sidebar**: Navigation, plan indicator, usage meter

---

## 9. Project Structure

```
src/
  app/
    (auth)/login/page.tsx, signup/page.tsx, callback/route.ts
    (dashboard)/layout.tsx, dashboard/page.tsx, invoices/[id]/page.tsx, settings/page.tsx, billing/page.tsx
    (marketing)/page.tsx, pricing/page.tsx, layout.tsx
    api/
      invoices/route.ts (GET list with pagination/filters)
      invoices/upload/route.ts (POST upload + trigger processing)
      invoices/[id]/route.ts (GET detail, PATCH edit fields, DELETE)
      invoices/export/route.ts (GET CSV/JSON export)
      stripe/checkout/route.ts (POST create session)
      stripe/portal/route.ts (POST create portal)
      webhooks/stripe/route.ts (POST webhook, raw body, nodejs runtime)
  components/
    ui/ (shadcn)
    invoices/ (InvoiceUploader, InvoiceCard, InvoiceDetail, ExtractionView, FieldEditor)
    dashboard/ (Stats, RecentInvoices, CategoryChart)
    layout/ (Sidebar, Header, MobileNav)
    marketing/ (Hero, Features, Pricing, CTA)
  lib/
    ocr/ (tesseract-worker.ts, pdf-parser.ts, image-preprocessor.ts)
    extraction/ (field-extractor.ts, regex-patterns.ts, date-parser.ts, amount-parser.ts, confidence-scorer.ts)
    vendor-learning/ (pattern-store.ts, pattern-matcher.ts)
    supabase/ (client.ts, server.ts, middleware.ts, types.ts)
    stripe/ (client.ts, webhooks.ts, plans.ts)
    duplicate/ (hash-generator.ts, similarity-matcher.ts)
    utils/ (format-currency.ts, date-helpers.ts, file-validators.ts)
  types/
    invoice.ts, user.ts, billing.ts, extraction.ts
```

---

## 10. Security

- RLS on all tables (`auth.uid() = user_id`)
- File validation server-side (PDF, PNG, JPG, WEBP only, max 10MB)
- Rate limiting on upload endpoints via `@upstash/ratelimit` with Supabase/Redis (NOT express-rate-limit, which is Express-only)
- Sanitize extracted text before rendering (escape HTML entities in server components; DOMPurify only if dangerouslySetInnerHTML is used)
- Stripe webhook signature verification
- Next.js middleware for auth on all /dashboard routes
- Environment variables for all secrets (never client-exposed)
- Stripe webhook handler: `export const runtime = 'nodejs'` + raw body parsing (no JSON middleware)

---

## 11. Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO=           # Stripe Price ID for Pro plan
STRIPE_PRICE_BUSINESS=      # Stripe Price ID for Business plan

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (optional — use in-memory for dev)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 12. API Pagination & Filtering

Invoice list endpoint (`GET /api/invoices`):
- **Pagination**: Offset-based (`page` + `limit`, default limit=20, max=100)
- **Sort**: `sort_by` (created_at, invoice_date, total_amount, vendor_name) + `sort_order` (asc/desc), default: created_at desc
- **Filters**: `status`, `category`, `vendor_name` (partial match), `date_from`, `date_to`, `amount_min`, `amount_max`
- **Search**: `q` parameter searches vendor_name and invoice_number
- **Response**: `{ data: Invoice[], total: number, page: number, limit: number, total_pages: number }`

---

## 13. Error Handling

| Failure | User sees | System action |
|---------|-----------|---------------|
| Upload fails (network) | "Upload failed. Please try again." | No DB record created |
| OCR timeout | Invoice saved with status 'failed' | User can retry or enter data manually |
| OCR returns empty text | Invoice saved with status 'completed', all fields red | User enters data manually |
| Stripe webhook fails | Plan unchanged | Stripe retries automatically (up to 3 days) |
| File too large (>10MB) | "File exceeds 10MB limit" | Upload rejected client-side + server-side |
| Invalid file type | "Only PDF, PNG, JPG, WEBP allowed" | Upload rejected client-side + server-side |
| Duplicate detected (hash) | "This invoice has already been uploaded" with link to original | Upload blocked |
| Duplicate detected (fuzzy) | Warning banner: "Similar invoice found" with link. User can proceed or cancel | Upload allowed with `duplicate_of` reference |

---

## 14. Implementation Order

1. Project setup (Next.js 15 + TypeScript + Tailwind + shadcn/ui + env config)
2. Supabase schema + RLS policies + storage bucket
3. Auth flow (login, signup, middleware, protected routes)
4. Landing page + pricing page
5. Dashboard layout (sidebar, header, stats)
6. Invoice upload (drag & drop + Supabase Storage + file validation)
7. OCR pipeline (pdf-parse + Tesseract.js server + preprocessing)
8. Rule-based field extraction (regex patterns + confidence scoring)
9. Invoice list + detail views (with inline field editing)
10. Vendor pattern learning (store corrections, reuse patterns)
11. Export functionality (CSV/JSON)
12. Duplicate detection (hash + fuzzy matching)
13. Stripe integration (checkout, webhooks, portal)
14. Usage limits enforcement
15. Dark mode + responsive polish
