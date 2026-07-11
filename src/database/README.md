# Database Seeder

This document covers how to seed the database and how to refresh the seed data from a live DB.

---

## Quick Reference

| Task | Command | Notes |
|---|---|---|
| Seed everything (permissions, subjects, curriculum, questions) | `npm run seed` | Idempotent — safe to re-run, matches every record by slug and skips what already exists |
| Refresh the seed snapshot from the current DB | `npm run seed:snapshot` | Overwrites `seeds/data/*.seed.json` with the live DB state |
| Generate standard quizzes from seeded questions | `npm run seed:quizzes` | Separate concern — quiz generation, not raw data |

---

## What `npm run seed` Does

The seeder is the **authoritative source of truth** — it fully reproduces the curriculum + question bank from four JSON snapshot files. It runs in this order:

```
1. Permissions       — synced from UserPermissionEnum (00-permission.seeder.ts)
        ↓
2. Core              — job roles + subjects, upserted by slug (01-core.seeder.ts ← data/01-core.seed.json)
        ↓
3. Curriculum        — topics + subject tracks + track↔topic links, upserted by slug (02-curriculum.seeder.ts ← data/02-curriculum.seed.json)
        ↓
4. Programs          — job-role↔subject links + certification tracks + cert↔track links (03-programs.seeder.ts ← data/03-programs.seed.json)
        ↓
5. Questions         — questions + options + topic links, upserted by slug (04-question.seeder.ts ← data/04-questions.seed.json)
```

Every step matches by a natural key (slug, or a unique composite key for join tables) and **skips** records that already exist — nothing is ever cleared or overwritten. Running `npm run seed` twice in a row is a no-op the second time.

```bash
npm run seed
```

---

## Refreshing the Snapshot

The four `data/*.seed.json` files are a point-in-time export of the database. If you add or edit curriculum/questions through the API (not through the seeder), refresh the snapshot before committing so a fresh environment can reproduce the current state:

```bash
npm run seed:snapshot
```

This overwrites `src/database/seeds/data/01-core.seed.json` through `04-questions.seed.json` with the live DB content. Review the diff before committing — it's a full re-dump, not a merge.

---

## File Structure

```
src/database/
├── data-source.ts                      Standalone TypeORM DataSource (used by seed.ts and scripts)
├── README.md                           This file
├── scripts/
│   ├── export-seed-snapshot.ts         ← npm run seed:snapshot
│   └── seed-standard-quizzes.ts        ← npm run seed:quizzes
└── seeds/
    ├── seed.ts                         Main orchestrator — npm run seed
    ├── data/
    │   ├── 01-core.seed.json           Job roles, subjects
    │   ├── 02-curriculum.seed.json     Topics, subject tracks, track↔topic links
    │   ├── 03-programs.seed.json       Job-role↔subject links, certification tracks, cert↔track links
    │   └── 04-questions.seed.json      Questions, options, topic links
    └── seeders/
        ├── 00-permission.seeder.ts     Code-driven from UserPermissionEnum (not from a JSON snapshot)
        ├── 01-core.seeder.ts
        ├── 02-curriculum.seeder.ts
        ├── 03-programs.seeder.ts
        └── 04-question.seeder.ts
```

---

## Technical Details

### Matching keys

| Entity | Matched by |
|---|---|
| JobRole, Subject | `slug` |
| Topic, SubjectTrack | `slug` (global unique) |
| SubjectTrackTopic | `(subjectTrackId, topicId)` |
| JobRoleSubject | `(jobRoleId, subjectId)` |
| CertificationTrack | `(jobRoleId, title)` |
| CertificationTrackSubjectTrack | `(certificationTrackId, subjectTrackId)` |
| Question | `slug` (global unique, max 48 chars) |

### Credentials & environment

`data-source.ts` reads env vars first, then falls back to hardcoded dev defaults. **Empty string is honoured** — setting `DB_PASSWORD=` in `.env` connects with no password (common for local XAMPP/WAMP root).

| Variable | Hardcoded default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USERNAME` | `codemerituser` |
| `DB_PASSWORD` | `GwjU067FL8hcmjQkXjaM` |
| `DB_DATABASE` | `codemeritdb` |

Create a `.env` file at the project root to override. Example for a local XAMPP setup:

```env
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=codemeritdb
```

---

## Common Mistakes

**`npm run seed` doesn't pick up my API changes** — The seeder only reads `data/*.seed.json`. Run `npm run seed:snapshot` first to refresh those files from the live DB, then commit them.

**Import fails with "Subject not found" / "Topic not found" warnings** — A `subjectSlug` or `topicSlug` in the JSON doesn't match a `slug` column in the DB. This usually means the snapshot is out of sync with the DB you're seeding into — re-run `npm run seed:snapshot` against the source DB.

**`npm run seed` fails with access denied** — Check your `.env` file. `DB_PASSWORD=` (empty string, not omitted) is required for local MySQL root with no password.
