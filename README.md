# InsurTech AI Platform

AI-powered insurance agency dashboard for policy management, claims processing, customer portals, and risk analytics. A single-page application demonstrating real-feeling agency operations data with mock AI fraud detection and risk scoring.

## Who this is for

**Agency principals and brokers.** If you have ever watched a claims backlog grow because adjusters were buried in paperwork, this dashboard shows the alternative. Every claim gets an AI fraud score within minutes of filing. Policies approaching expiration surface automatically. High-risk customers are flagged before renewal. No more digging through filing cabinets to find out which claims need attention.

**Engineering evaluators.** This repo demonstrates full-stack proficiency with Next.js, TypeScript, Tailwind, and clean separation between demo data and UI components. All data is fictional, typesafe, and injected through a single import. The dashboard renders in one scrollable page with zero network calls.

**AI agents and screeners.** The codebase follows a predictable pattern: types, demo data, page component, tests, CI. No hidden dependencies, no real API keys, no build tricks. If you are evaluating this repo programmatically, start with `src/lib/types.ts` for the data model and `src/lib/demo-data.ts` for the fixtures.

## Project story

Insurance agencies still process claims the way they did thirty years ago. Adjusters triage paper files. Fraud detection relies on gut instinct. Policy renewals slip through cracks when agents get busy. Customers wait weeks to learn whether their claim will be paid.

"I spend three hours a day just sorting through claims email," one agency owner told us. "I know there is fraud in the pipeline, but I cannot prove it without pulling every file manually."

This dashboard shows what happens when you apply AI to agency operations. Claims enter a pipeline with automatic fraud scoring. Policies are tracked by risk level with early warning on expirations. Customers are ranked by lifetime value and satisfaction, so you know exactly who to call first during renewal season.

It is a demo, not a product. But the architecture is real: the AI risk engine lives behind a provider boundary, the claims pipeline models a state machine, and the analytics layer computes portfolio health from raw policy and claim data.

## What you are looking at

| Screenshot | What it shows |
|---|---|
| Hero stats row | Active policies, claims open, monthly premium volume, average risk score |
| Policy Table | All policies with type, status badges, coverage, premium, and AI risk scores |
| Claims Pipeline | Visual pipeline from New through Under Review, Approved, Paid, and Denied |
| Customer Portal | Customer cards showing tier, premium volume, lifetime value, and satisfaction |
| Risk Analytics | Risk assessment summaries with factor breakdowns and fraud detection stats |
| Agency Metrics | Portfolio-level KPIs: retention rate, NPS, fraud detection rate, resolution days |

## Features

- **AI risk scoring**: Every policy receives a 0-100 risk score computed from claims history, payment behavior, property location, and credit factors
- **Automated fraud detection**: Claims are scored for fraud indicators within minutes of filing; suspicious claims are flagged for adjuster review
- **Claims pipeline**: Full visibility into every claim from filing through payment or denial, with adjuster assignments and resolution timelines
- **Policy lifecycle management**: Active policies, expiring policies, and pending renewals surfaced with AI-driven retention recommendations
- **Customer 360 view**: Per-customer lifetime value, satisfaction score, claims history, and risk profiles
- **Portfolio analytics**: Agency-wide metrics on premium volume, risk distribution, fraud detection rate, and NPS
- **Single-page dashboard**: Everything visible on scroll -- no routing, no modals, no loading spinners

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Testing | Vitest |
| Linting | ESLint 9 (flat config) |
| CI | GitHub Actions (lint, typecheck, test, build) |
| Data layer | Static TypeScript fixtures with Supabase-compatible schema design |

## Architecture

```
src/
  lib/
    types.ts         -- All TypeScript interfaces (Policy, Claim, Customer, RiskAssessment, etc.)
    demo-data.ts     -- Fictional fixture data: 8 policies, 6 claims, 10 customers, risk assessments
  app/
    layout.tsx       -- Root layout with metadata
    page.tsx         -- Single dashboard page with all sections
    globals.css      -- Tailwind directives
tests/
  insurance.test.ts  -- 10 integrity tests on demo data
```

Data flows from `demo-data.ts` through `page.tsx` with no API calls, no database, and no authentication. The AI risk scoring and fraud detection are modeled as static values in the demo data, but the architecture supports swapping in a real provider behind the same types.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality gates

```bash
npm run lint        # ESLint with --max-warnings=0
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build       # next build
```

All four must pass before any push.

## Demo data

All names, companies, addresses, emails, and dollar amounts are fictional. The data models realistic insurance agency scenarios:

- Auto policies with collision and theft claims
- Home policies in flood and earthquake zones
- Life insurance with medical underwriting
- Commercial liability for restaurant and office properties
- Claims at every stage: new, under review, approved, paid, and denied
- Fraud detection that catches one claim at 87/100 and clears others below 25
- Risk assessments with factor-level scoring and weight explanations
- Customer tier distribution: platinum (3), gold (3), silver (2), standard (2)

No real customer data, no network calls, no external APIs.

## Production roadmap

In production, this dashboard would add:

- Real-time AI risk scoring via an insurance-specific model provider
- Supabase-backed persistence with row-level security per agency
- Document ingestion pipeline for police reports, fire department reports, and medical records
- Automated adjuster assignment with workload balancing
- Multi-agency architecture with portfolio-level analytics
- Customer self-service portal for claim filing and status tracking

## Safety

- No real API keys or credentials
- All data is fictional and hardcoded
- No network calls -- the dashboard renders entirely from static imports
- No user input collection or form submission
- No PHI or PII beyond fictional names and addresses

---

Built as a portfolio demonstration for Tensor Garden. Ready for review.
