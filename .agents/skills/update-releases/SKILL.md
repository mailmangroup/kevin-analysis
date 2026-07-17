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
2. **One file per update batch** — merge every kawo-kevin version since the last documented release into a **single** new entry at the **latest** version number. Do **not** create seperate ones.
3. **Reuse GitHub release notes** — fetch with `gh release view`, rewrite for a sales audience. Do not mine git logs unless release notes are missing.
4. **Plain English** — non-technical audience. See `lib/releases/types.ts` for the data model.

## Workflow

```
- [ ] Find latest documented version in lib/releases/index.ts
- [ ] List kawo-kevin GitHub releases after that version
- [ ] Fetch notes for each intermediate release (gh release view)
- [ ] Merge + dedupe into one lib/releases/vX_Y_Z.ts (latest version)
- [ ] Register import in lib/releases/index.ts
- [ ] Delete any wrongly created per-version files
- [ ] Typecheck both apps
```

### 1. Find the gap

Read `lib/releases/index.ts` — the newest registered release is the baseline (e.g. `v0_8_3`).

### 2. Fetch kawo-kevin release notes

```bash
cd /Users/jeremydai/kawo/kevin-workspace/kawo-kevin
gh release list --limit 20
```

For each tag from (baseline + 1) through latest:

```bash
gh release view v0.8.9
```

### 3. Create one merged release file

- File: `lib/releases/v0_8_9.ts` (underscores, matching existing convention)
- `version`: latest tag (e.g. `"v0.8.9"`)
- `date`: publish date of the **latest** tag (`YYYY-MM-DD`)
- `name`: short human title
- `summary`: one line covering the whole batch; mention it spans since the previous documented release
- `changes`: **synthesize** across all intermediate GitHub releases — group related bullets into themed entries (~6–10 items), do not list bullets 1:1

Register in `lib/releases/index.ts`:

```ts
import { v0_8_9 } from './v0_8_9'
// add to ALL_RELEASES array
```

### 4. Writing changes

| Field | Guidance |
|-------|----------|
| `title` | Short friendly headline |
| `description` | 1–2 sentences, plain English |
| `type` | `feature` · `improvement` · `fix` |
| `scope` | See scopes in `lib/releases/types.ts` |
| `frontendEnabled` | Omit (live) or `false` for backend-only / internal work |

**Scope mapping** (kawo-kevin → scope):

| Area | Scope |
|------|-------|
| chat, models, image/memory | Kevin Chat |
| comment/content/tag/SOV analysis | Analysis Service |
| report generation/insights | AI Report |
| phoenix, cost, infra, dev-only | Ops & Analytics |

**Skip or mark `frontendEnabled: false`:**

- Internal refactors (e.g. enum renames, factory cleanup)
- `docs:` / `unittest` / AGENTS.md-only changes
- Developer-only localization

**Synthesize, don't transcribe:**

- Group related bullets into one themed change (e.g. all comment-analysis topic-merge fixes → "Sharper comment analysis")
- Deduplicate across versions (e.g. qwen3.6 in v0.8.5 + v0.8.6 → one entry)
- Drop internal/dev-only items (refactors, docs, localization)
- Target ~6–10 changes per release batch, not one entry per GitHub bullet

### 5. Verify

```bash
cd /Users/jeremydai/kawo/kevin-analysis && npx tsc --noEmit
cd /Users/jeremydai/kawo/kevin-workspace/hi-kevin && npx tsc --noEmit
```

## Example

GitHub releases v0.8.4–v0.8.9 exist; `lib/releases/index.ts` last has `v0_8_3`.

→ Create **only** `lib/releases/v0_8_9.ts` with all changes merged.
→ Do **not** create `v0_8_4.ts` … `v0_8_8.ts`.

## Reference files

- Data model & scopes: `lib/releases/types.ts`
- Good style example: `lib/releases/v0_8_3.ts`, `lib/releases/v0_8_9.ts`
- UI consumer: `app/releases/page.tsx`
