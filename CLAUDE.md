# CLAUDE.md — Mirqolyzer

## Project Overview

**Mirqolyzer** is a SaaS invoice analyzer for SMBs and accountants. Users upload invoices/receipts (PDF, images) and a rule-based OCR pipeline extracts structured data — no LLM/AI APIs.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui v4 (Base UI)
- **OCR**: Tesseract.js v7 (server-side for images), pdf-parse v1 (text PDFs)
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Payments**: Stripe (Checkout + Webhooks + Customer Portal)
- **Testing**: Vitest + jsdom

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run lint         # ESLint
```

## Architecture

### Request Flow
```
Upload → API Route (/api/invoices/upload)
  → File validation → Storage upload → OCR pipeline
  → Text PDF: pdf-parse (~100ms) | Image/Scanned: Tesseract.js (5-15s)
  → Regex field extraction → Confidence scoring → DB save
```

### Key Patterns

- **Supabase SSR auth**: `@supabase/ssr` with cookie-based sessions, middleware refreshes tokens
- **RLS everywhere**: All tables enforce `auth.uid() = user_id` (or `= id` for profiles)
- **Source of truth**: `extracted_data` JSONB in invoices table. Top-level columns are denormalized indexes for filtering
- **Lazy Stripe init**: `stripe` export uses a Proxy to avoid crash at build time when env vars are empty
- **pdf-parse v1 quirk**: Requires `test/data/05-versions-space.pdf` fixture to exist (loaded at import time)
- **shadcn/ui v4**: Uses Base UI, NOT Radix. No `asChild` prop — use `render` prop instead for trigger composition

### Database Schema

- **profiles** — auto-created via DB trigger on signup. PK = auth.users.id
- **invoices** — file metadata + extracted data + denormalized columns for search
- **line_items** — Phase 2 (schema exists, no automated extraction)
- **vendor_patterns** — learned patterns from user corrections (Pro/Business only)

### Billing Tiers

| Plan | Price | Invoices/mo | JSON Export | Vendor Learning |
|------|-------|-------------|-------------|-----------------|
| Free | $0 | 5 | No | No |
| Pro | $29 | 50 | Yes | Yes |
| Business | $59 | 500 | Yes | Yes |

## Project Structure

```
src/
  app/
    (auth)/          — login, signup, callback
    (dashboard)/     — dashboard, invoices/[id], settings, billing
    (marketing)/     — landing page, pricing
    api/invoices/    — upload, list, detail, export
    api/stripe/      — checkout, portal
    api/webhooks/    — stripe webhook
  components/
    ui/              — shadcn components
    invoices/        — uploader, field-editor, extraction-view
    dashboard/       — stats, recent-invoices
    layout/          — sidebar, header, mobile-nav, theme
    marketing/       — hero, features, pricing, cta
  lib/
    ocr/             — pdf-parser, tesseract-worker, pipeline
    extraction/      — regex-patterns, field-extractor, confidence-scorer
    vendor-learning/ — pattern-store, pattern-matcher
    supabase/        — client, server, middleware
    stripe/          — client, plans, webhooks
    duplicate/       — hash-generator, similarity-matcher
    utils/           — file-validators, format-currency, date-helpers
  types/             — invoice, user, billing, extraction
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- Supabase project URL, anon key, service role key
- Stripe secret key, webhook secret, publishable key, price IDs
- App URL (defaults to http://localhost:3000)

## Database Setup

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor. This creates all tables, RLS policies, triggers, and the storage bucket.

## Key Conventions

- **No AI/LLM APIs** — all extraction is regex + heuristics
- **Confidence scoring**: >= 0.7 green, 0.4-0.69 yellow, < 0.4 red
- **Scanned PDFs**: limited to single page for MVP (Vercel timeout constraint)
- **Edit sync**: Field edits update both JSONB and denormalized columns via `update_invoice_field` RPC
- **Dark mode**: next-themes with class strategy, system default
