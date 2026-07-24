---
name: update-releases
description: >-
  Update the kevin-analysis /releases page from kawo-kevin GitHub release notes.
  Use when the user asks to update, add, or sync product releases, release notes,
  or changelog entries for Kevin.
---

# Update Releases (kevin-analysis)

Curated release notes for the `/releases` page. Source of truth is **kawo-kevin GitHub releases**, not git commits.

## Key rules

1. **kawo-kevin only** — do not pull from hi-kevin or other frontends unless the user explicitly asks.
2. **One file per update batch** — merge every kawo-kevin version since the last documented release into a **single** new entry at the **latest** version number. Do **not** create separate ones.
3. **Reuse GitHub release notes** — fetch with `gh release view`, rewrite for a sales audience. Do not mine git logs unless release notes are missing.
4. **Plain English** — non-technical audience. See `lib/releases/types.ts` for the data model.
5. **Scope by where it lives in kawo-kevin** — words like "analysis", "competitor", or "report" in a bullet are not enough. When unsure, open the matching code path (see below).

## Workflow

```
- [ ] Find latest documented version in lib/releases/index.ts
- [ ] List kawo-kevin GitHub releases after that version
- [ ] Fetch notes for each intermediate release (gh release view)
- [ ] If a bullet's scope is ambiguous, locate it in kawo-kevin (skills vs routers vs reports)
- [ ] Merge + dedupe into one lib/releases/vX_Y_Z.ts (latest version)
- [ ] Register import in lib/releases/index.ts
- [ ] Delete any wrongly created per-version files
- [ ] Typecheck both apps
```

### 1. Find the gap

Read `lib/releases/index.ts` — the newest registered release is the baseline (e.g. `v0_9_3`).

### 2. Fetch kawo-kevin release notes

Repo path on this machine:

```bash
cd /Users/jeremydai/kawo/kawo-kevin
gh release list --limit 20
```

For each tag from (baseline + 1) through latest:

```bash
gh release view v0.9.5
```

### 3. Create one merged release file

- File: `lib/releases/v0_9_5.ts` (underscores, matching existing convention)
- `version`: latest tag (e.g. `"v0.9.5"`)
- `date`: publish date of the **latest** tag (`YYYY-MM-DD`)
- `name`: short human title
- `summary`: one line covering the whole batch; mention it spans since the previous documented release
- `changes`: **synthesize** across all intermediate GitHub releases — group related bullets into themed entries (~6–10 items), do not list bullets 1:1

Register in `lib/releases/index.ts`:

```ts
import { v0_9_5 } from './v0_9_5'
// add to ALL_RELEASES array
```

### 4. Writing changes

| Field | Guidance |
|-------|----------|
| `title` | Short friendly headline |
| `description` | 1–2 sentences, plain English. If chat-only, saying "In chat, …" is fine |
| `type` | `feature` · `improvement` · `fix` |
| `scope` | Exact string from `lib/releases/types.ts` (see mapping below) |
| `frontendEnabled` | Omit (live) or `false` for backend-only / internal work |

#### Scope mapping (prefer kawo-kevin path over wording)

Scope names must match `lib/releases/types.ts` exactly:

`Kevin Chat` · `Claw` · `Video` · `Analysis Service` · `AI Report` · `Content Generation` · `Ops & Analytics`

| If the change lives mainly in… | Scope |
|--------------------------------|-------|
| `app/tools/skills/*`, `app/tools/deep_skills/*`, agent/chat routers, models, memory, image chat | **Kevin Chat** |
| Claw / Office file deep skills (`docx`, `pptx`, `xlsx`), streaming todos | **Claw** |
| `batch_video_analysis_*`, video compliance / evaluation | **Video** |
| Analysis **service** routers/pipelines: content/tag/comment analysis jobs, SOV **job** APIs (`sov_router`, polling, expiry) | **Analysis Service** |
| `app/tools/report_*.py`, `reports_router`, report insight generation | **AI Report** |
| `content_generation` | **Content Generation** |
| Phoenix, cost, eval dashboards, MCP server, infra, dev tooling | **Ops & Analytics** |

#### Common pitfalls (do not guess from the noun)

| Release-note wording | Usually is | Not |
|----------------------|------------|-----|
| "brand analysis", `competitor_groups`, own-brand post/comment search | **Kevin Chat** (brand_analysis skill) | Analysis Service / AI Report |
| "SOV" skill actions in chat | **Kevin Chat** | Analysis Service |
| "SOV job expired / polling / service" | **Analysis Service** | Kevin Chat |
| "competitor report / brand report / group report" | **AI Report** | Kevin Chat |
| "AI tagging onboarding" API / readiness pipeline | **Analysis Service** (often `frontendEnabled: false`) | Kevin Chat |
| Topic words alone ("analysis", "competitor", "tag") | — follow the path table above | — |

When a bullet is ambiguous: in `/Users/jeremydai/kawo/kawo-kevin`, `rg` the distinctive phrase or check commits between tags (`gh release view` + related PR/files). Prefer the owning package over the English noun.

**Skip or mark `frontendEnabled: false`:**

- Internal refactors (e.g. enum renames, factory cleanup)
- `docs:` / `unittest` / AGENTS.md-only changes
- Developer-only localization
- API/pipeline shipped without customer UI yet (batch video, onboarding APIs, Phoenix ETL, eval dashboards)

**Synthesize, don't transcribe:**

- Group related bullets into one themed change (e.g. all comment-analysis topic-merge fixes → "Sharper comment analysis")
- Deduplicate across versions (e.g. qwen3.6 in v0.8.5 + v0.8.6 → one entry)
- Drop internal/dev-only items (refactors, docs, localization)
- Target ~6–10 changes per release batch, not one entry per GitHub bullet

### 5. Verify

```bash
cd /Users/jeremydai/kawo/kevin-analysis && npx tsc --noEmit
cd /Users/jeremydai/kawo/hi-kevin && npx tsc --noEmit
```

## Example

GitHub releases v0.9.4–v0.9.5 exist; `lib/releases/index.ts` last has `v0_9_3`.

→ Create **only** `lib/releases/v0_9_5.ts` with all changes merged.
→ Do **not** create `v0_9_4.ts`.

## Reference files

- Data model & scopes: `lib/releases/types.ts`
- Good style example: `lib/releases/v0_9_3.ts`, `lib/releases/v0_9_5.ts`
- UI consumer: `app/releases/page.tsx`
- Keep this skill mirrored: `.claude/skills/update-releases/SKILL.md` and `.agents/skills/update-releases/SKILL.md`
