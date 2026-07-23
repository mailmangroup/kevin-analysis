# Kevin Usage Analysis Dashboard

Analytics dashboard for Kevin usage metrics (Next.js 14 + TypeScript). Also hosts curated, sales-facing Kevin release notes at `/releases`.

## Getting Started

**Prerequisites:** Node.js 18+, a Supabase project, access to the KAWO API backend.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional local overrides (otherwise from Supabase user profile)
# NEXT_PUBLIC_KAWO_BRAND_ID=
# NEXT_PUBLIC_KAWO_TOKEN=
# NEXT_PUBLIC_KAWO_ORG_ID=
# NEXT_PUBLIC_KAWO_API_URL=
```

Production env vars live in **Vercel Settings** (not `.env.local`) — redeploy after changes.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production |
| `npm run lint` | ESLint |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard overview |
| `/questions` | Question analysis |
| `/cost` | Cost / usage |
| `/retention` | Retention cohorts |
| `/analysis` | Analysis |
| `/geo-analysis` | GEO analysis |
| `/releases` | Curated Kevin release notes |
| `/settings` | Settings |
| `/login` | Auth |

## Docs for agents

- Gotchas & project context: [`CLAUDE.md`](./CLAUDE.md)
- Design system: [`DESIGN.md`](./DESIGN.md)
- Updating `/releases`: [`.claude/skills/update-releases/SKILL.md`](./.claude/skills/update-releases/SKILL.md)
