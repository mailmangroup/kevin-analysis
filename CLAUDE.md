# kevin-analysis

Next.js 14 analytics dashboard for Kevin usage. Auth via Supabase; data from KAWO API (`lib/api.ts`). Also hosts curated product release notes at `/releases`.

Sibling app that often needs the same typecheck: `/Users/jeremydai/kawo/kevin-workspace/hi-kevin`.

## Gotchas

- **改完代码,两个 app 都要 typecheck**,别只跑当前这个:
  - 本 repo(kevin-analysis):`npx tsc --noEmit`
  - 另一个:`cd /Users/jeremydai/kawo/kevin-workspace/hi-kevin && npx tsc --noEmit`

- **Supabase 的 redirect URL 用 `/**` 通配**,比如 `http://localhost:3000/**`。换端口了就再加一条,旧的不会自动顶替。

- **Vercel 的环境变量在网站 Settings 里改,不是 `.env.local`**。而且改完不会自动生效,得重新 deploy 一次。

## Layout

```
app/                 # routes: /, /questions, /cost, /retention, /analysis,
                     #         /geo-analysis, /releases, /settings, /login
components/          # UI (HeroKPI*, charts, Navbar, …)
lib/
  api.ts             # KAWO API client (env vars locally, else Supabase profile)
  releases/          # one file per version batch + index.ts + types.ts
  supabase/          # client / server / middleware
  store/             # Zustand (user, language, time-period)
middleware.ts        # auth session + redirect to /login
```

## Auth & KAWO context

Supabase login required. User profile fields used for API calls:

- `kawo_token`, `kawo_org_id`, `kawo_brand_id`, `kawo_api_url`

Local overrides via `NEXT_PUBLIC_KAWO_*` in `.env.local` (see `.env.local.example`).

## Release notes (`/releases`)

Curated for a non-technical / sales audience. Source of truth: **kawo-kevin GitHub releases** (`gh release view`), not git commits.

- UI: `app/releases/page.tsx`
- Data: `lib/releases/vX_Y_Z.ts`, registered in `lib/releases/index.ts`
- How to update: follow `.claude/skills/update-releases/SKILL.md` (also mirrored under `.agents/skills/`)
- Merge every kawo-kevin version since the last documented release into **one** new entry at the latest version number
- `frontendEnabled: false` = backend-only, not yet live for customers

## Design

See [`DESIGN.md`](./DESIGN.md) for the amber-based design system and component patterns. Do not invent a parallel palette.
