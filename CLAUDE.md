# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Агроном** — a Russian-language, mobile-first microgreens growing diary. Users model a physical rack as `Shelf → ShelfLevel → Tray → Container`, plant species into containers, advance them through growth stages, and receive Telegram reminders. UI copy is in Russian.

## Commands

```bash
npm run dev          # local dev server (Next.js)
npm run build        # prisma db push (against .env.local) + next build
npm run lint         # eslint (next lint)
npm run db:push      # push schema to DB named in .env.local
npm run db:seed      # seed 3 species + default shelf (prisma/seed.ts)
npm run db:studio    # Prisma Studio
```

There is **no test suite**. `next lint` and `npm run build` (which runs the TypeScript compiler) are the only automated checks — run `npm run build` before deploying.

Note: db/build scripts load env via `node --env-file=.env.local`, so `.env.local` must contain a reachable `DATABASE_URL` / `DATABASE_URL_UNPOOLED` even for a local build.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma + **PostgreSQL** (Neon) · Tailwind CSS v3 · Grammy (Telegram) · lucide-react icons.

**Data model** (`prisma/schema.prisma`): the rack hierarchy is `Shelf → ShelfLevel → Tray → Container`. A `Container` references a `Species` and carries a `stage` string. `Species` stores agronomy params plus `steps`/`readySigns`/`overgrownSigns` as **JSON-encoded strings** (parsed with `JSON.parse` in pages). Clearing/deleting a container writes a `CropHistory` row instead of losing data.

**Growth stages** are a string state machine, defined canonically in `lib/utils.ts` (`GrowthStage`, `STAGE_ORDER`, `STAGE_LABELS`, `nextStage`):
`EMPTY → PREPARATION → DARK_PHASE → LIGHT_PHASE → READY → HARVESTED`.
Containers advance one step via `POST /api/containers/[id]/advance`. Several components keep their **own local copies** of stage→color/label maps (e.g. `ContainerCell`, `ContainerModal`, `app/page.tsx`) — when stage semantics or palette change, update all of them.

**Rendering:** pages are React Server Components that query Prisma directly (most declare `export const dynamic = "force-dynamic"`). Interactivity lives in `"use client"` components under `components/` that call the JSON API routes in `app/api/**` and then `router.refresh()` to re-fetch server data. There is no client state library.

**Layout:** `app/layout.tsx` → `components/layout/AppShell.tsx` chooses chrome by pathname (`/login` renders bare). Desktop uses `Sidebar`; mobile uses `MobileHeader` + bottom `MobileNav`. Mobile-first is the priority — design for small screens first.

**Telegram bot** (`lib/telegram.ts`): a singleton Grammy `Bot`. Commands (`/start`, `/status`, `/help`) are registered in `buildBotCommands()`. Updates arrive at `POST /api/telegram`, gated by the `x-telegram-bot-api-secret-token` header matching `TELEGRAM_WEBHOOK_SECRET`. Register the webhook **after deploy** by visiting `GET /api/telegram?setup=1` (it calls Telegram's `setWebhook` directly via fetch — not Grammy — because Grammy's helper was unreliable on Vercel). Users link their account by pasting the Chat ID from `/start` into Settings.

**Notifications:** scheduled rows in `NotificationSchedule`. `GET /api/cron` calls `processDueNotifications()` (`lib/notifications.ts`) and is meant to run on a schedule, protected by `Authorization: Bearer $CRON_SECRET`. ⚠️ `vercel.json` is currently empty (`{}`) — no Vercel Cron is defined, so due notifications are not sent automatically in production until a cron entry (or external scheduler) is added.

## Deployment (Vercel)

The repo is already linked (`.vercel/project.json`, project `agronom`). DB is Neon Postgres. Required env vars in Vercel: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` (the production URL), `CRON_SECRET`. After a production deploy: (1) ensure schema is pushed to Neon, (2) hit `/api/telegram?setup=1` to (re)register the webhook against the production URL. `.npmrc` sets `legacy-peer-deps` for install on Vercel.

## Conventions

- Styling is a **CSS-variable design system** in `app/globals.css` (`--bg`, `--surface`, `--card`, `--border`, `--green-sprout`, stage colors, `.ui-button-primary`, `.ui-card`, etc.). `tailwind.config.ts` also defines a parallel color set; the CSS variables in `globals.css` are the source of truth used by inline `style={{}}` props throughout. Keep both in sync when changing the palette.
- Russian pluralization is done with hand-written helpers (e.g. `pluralize` in `app/page.tsx`).
- Dates/относительное время via `date-fns` with the `ru` locale (`lib/utils.ts`).
</content>
</invoke>
