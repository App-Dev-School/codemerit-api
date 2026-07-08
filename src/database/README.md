# Database Seeder & Content Import

This document covers how to seed the database, import curriculum content, and manage questions (import, export, and review/update).

---

## Quick Reference

| Task | Command | Notes |
|---|---|---|
| Seed job roles, subject tracks, cert tracks | `npm run seed` | Idempotent — safe to re-run |
| Import topics + subject tracks for a subject | `npm run import:curriculum -- <file.json>` | See §3 |
| Import questions for a subject | `npm run import:questions -- <file.json>` | See §4 |
| Export questions for review | `npm run export:questions -- <subject-slug>` | See §5 |
| Update questions in-place | `npm run import:questions -- <file.json> --update` | See §5 |

---

## What `npm run seed` Does

The seeder is the **authoritative source of truth** for structured data that does not change often. It runs in this order:

```
1. Job Roles          — upserts from 02-job-role.seeder.ts (27 canonical roles)
        ↓
2. Subject Tracks     — inserts from 04-subject-track.seeder.ts (skips if exists)
        ↓
3. Subject Track Topics — links topics to tracks via 05-subject-track-topic.seeder.ts
        ↓
4. Job Role Subjects  — CLEARS + re-inserts from 06-job-role-subject.seeder.ts
        ↓
5. Certification Tracks — CLEARS + re-inserts from 07-certification-track.seeder.ts
        ↓
6. Cert Track ↔ Subject Track — links via 08-certification-track-subject-track.seeder.ts
```

> ⚠ **Seeders 06 and 07 are destructive.** They delete all existing records on every run before re-inserting from the seeder file. Do not create job role subjects or certification tracks via the API if you intend to run `npm run seed` again.

Subjects, Topics, and Questions are **not touched** by the seeder — manage them via `import:curriculum`, `import:questions`, or the API.

---

## Step-by-Step: First-Time Setup

### Step 1 — Run the seeder

```bash
npm run seed
```

This populates:
- All 27 job roles (with `scope`, `color`, `description`, `orderId`)
  - 2 Digital Skills roles: Digital Literacy, Office Professional
  - 25 developer roles: Trainee SE through Program Manager
- Subject tracks defined in seeder 04 (JS, TS, Python foundations)
- 54 certification tracks across 13 job role pathways
- Job role ↔ subject links (243 links across all 27 roles)

### Step 2 — Import subject curriculum (topics + tracks)

For each subject you want to populate, create a curriculum JSON and run:

```bash
npm run import:curriculum -- src/database/seeds/tailwind-curriculum.json
```

See §3 for the JSON format. Curriculum files for the following subjects are already included in `src/database/seeds/`:

| File | Subject | Topics | Tracks |
|---|---|---|---|
| `tailwind-curriculum.json` | Tailwind CSS | 14 | 3 |
| `computer-fundamentals-curriculum.json` | Computer Fundamentals | 12 | 2 |
| `internet-digital-curriculum.json` | Internet & Digital Skills | 10 | 2 |
| `microsoft-office-curriculum.json` | Microsoft Office | 16 | 4 |
| `data-entry-curriculum.json` | Data Entry & Productivity | 10 | 2 |
| `cloud-basics-curriculum.json` | Cloud Basics | 8 | 2 |
| `git-curriculum.json` | Git | 6 | 2 |
| `docker-curriculum.json` | Docker | 6 | 2 |
| `kubernetes-curriculum.json` | Kubernetes | 7 | 2 |
| `ci-cd-curriculum.json` | CI/CD | 6 | 2 |
| `devops-curriculum.json` | DevOps | 6 | 2 |
| `relational-databases-curriculum.json` | Relational Databases | 6 | 2 |

### Step 3 — Import questions

```bash
npm run import:questions -- src/database/seeds/questions-computer-fundamentals.json
```

Question files for the DCA subjects are already included in `src/database/seeds/`:

| File | Subject | Questions |
|---|---|---|
| `questions-computer-fundamentals.json` | Computer Fundamentals | 72 |
| `questions-internet-digital.json` | Internet & Digital Skills | 60 |
| `questions-microsoft-office.json` | Microsoft Office | 96 |
| `questions-data-entry.json` | Data Entry & Productivity | 60 |

---

## §3 — Curriculum JSON Format

The `import:curriculum` script is **idempotent** — it skips topics and tracks that already exist (matched by `subjectId + title`). Safe to re-run.

```bash
npm run import:curriculum -- <path-to-file.json>
```

**JSON format:**

```json
{
  "subjectSlug": "tailwind",
  "topics": [
    {
      "title": "Introduction to Tailwind CSS",
      "shortDesc": "Utility-first philosophy",
      "label": "Foundation",
      "order": 1,
      "weight": 1,
      "description": "Understand what Tailwind CSS is and why the utility-first approach differs from traditional CSS frameworks.",
      "goal": "Understand the utility-first philosophy and how Tailwind differs from traditional CSS frameworks.",
      "isPublished": true
    }
  ],
  "subjectTracks": [
    {
      "title": "Tailwind Foundations",
      "description": "Core Tailwind CSS skills — setup, utilities, layout, and responsive design.",
      "sortOrder": 1,
      "isPublished": true,
      "topicTitles": [
        "Introduction to Tailwind CSS",
        "Setup & Configuration"
      ]
    }
  ]
}
```

**Field reference:**

| Field | Required | Notes |
|---|---|---|
| `subjectSlug` | ✅ | Must match an existing `slug` in the `subject` table |
| `topics[].title` | ✅ | Unique per subject (case-sensitive). Used to match existing topics |
| `topics[].label` | ✅ | `Foundation`, `Intermediate`, or `Advanced` |
| `topics[].order` | ✅ | Display order within the subject |
| `topics[].weight` | ✅ | `1` (Foundation), `2` (Intermediate), `3` (Advanced) |
| `topics[].shortDesc` | — | Max ~20 chars. Shown as a subtitle in the UI |
| `topics[].description` | — | Full topic description |
| `topics[].goal` | — | Learning objective for the topic |
| `topics[].isPublished` | — | Defaults to `true` |
| `subjectTracks[].topicTitles` | ✅ | Must exactly match `topic.title` values (existing DB or in same file) |

> **Slugs are auto-generated** from the title. If a collision occurs, the subject ID is appended as a suffix.

---

## §4 — Importing Questions

```bash
npm run import:questions -- <path-to-file.json>
```

The script is **idempotent** — it skips any question already linked to the same topic with the same text.

> Always run `import:curriculum` for the subject first so topic records exist before importing questions.

**JSON format:**

```json
{
  "subjectSlug": "computer-fundamentals",
  "questions": [
    {
      "topicTitle": "What is a Computer?",
      "question": "Which component acts as the brain of a computer, executing instructions?",
      "level": 1,
      "timeAllowed": 60,
      "options": [
        { "option": "CPU (Central Processing Unit)", "correct": true, "comment": "The CPU fetches, decodes, and executes instructions." },
        { "option": "RAM (Random Access Memory)", "correct": false },
        { "option": "Hard Drive (HDD)", "correct": false },
        { "option": "GPU (Graphics Processing Unit)", "correct": false }
      ]
    }
  ]
}
```

**Field reference:**

| Field | Required | Notes |
|---|---|---|
| `subjectSlug` | ✅ | Must match an existing subject slug |
| `questions[].topicTitle` | ✅ | Must exactly match an existing topic title for this subject (case-sensitive) |
| `questions[].question` | ✅ | The question text |
| `questions[].level` | ✅ | `1` = Foundation (60 s), `2` = Intermediate (75 s), `3` = Advanced (90 s) |
| `questions[].timeAllowed` | ✅ | Seconds allowed to answer |
| `questions[].options` | ✅ | Exactly 4 options, exactly 1 with `correct: true` |
| `questions[].options[].option` | ✅ | Max 100 characters |
| `questions[].options[].comment` | — | Explanation shown after answering (recommended for the correct option) |

> The `slug` field is **not** included in new question files — it is assigned automatically on insert. It appears in **exported** files (see §5) and is used as the update key.

---

## §5 — Reviewing & Updating Questions

### The workflow

```bash
# 1. Export questions for a subject to JSON
npm run export:questions -- <subject-slug>

# 2. Edit the exported file in your editor
#    (see "What you can safely change" below)

# 3. Re-import with --update to apply changes in-place
npm run import:questions -- src/database/seeds/questions-<subject-slug>.json --update
```

### What the export produces

`export:questions` writes the questions back to the same file used for the original import (`src/database/seeds/questions-<subject-slug>.json`), adding a `slug` field to each question:

```json
{
  "subjectSlug": "computer-fundamentals",
  "questions": [
    {
      "slug": "cf-which-component-acts-as-the-brain",
      "topicTitle": "What is a Computer?",
      "question": "Which component acts as the brain of a computer, executing instructions?",
      "level": 1,
      "timeAllowed": 60,
      "options": [...]
    }
  ]
}
```

The `slug` is the update key — as long as it is present, `--update` mode can find and update the question even if you reword the question text.

### What you can safely change

| Field | Safe to change | Notes |
|---|---|---|
| `question` (text) | ✅ | Matched by slug, so rewording is safe |
| `options[].option` (text) | ✅ | Updated in-place by position — option IDs are preserved |
| `options[].comment` | ✅ | Updated in-place |
| `options[].correct` | ✅ | ⚠ Changes the correct answer — invalidates past attempt scores |
| `level` | ✅ | Also updates `marks` to match |
| `timeAllowed` | ✅ | — |
| `topicTitle` | ✅ | Moves the question to a different topic |
| `slug` | ❌ | Never change — this is the update key and the DB identifier |
| Option order | ❌ | Options are matched by position (1st→1st, 2nd→2nd). Reordering options reorders the DB rows incorrectly |

> **Once learners have attempt data:** changing `options[].correct` will invalidate historical scores. Prefer retiring a question (`status: Inactive`) and inserting a corrected version instead.

### How `--update` mode matches questions

1. **By slug** (preferred) — if a `slug` field is present in the JSON (i.e. the file came from `export:questions`), the script finds the question by slug and updates it in-place.
2. **By question text + topic** (fallback) — if no slug is present (a hand-written file), matches on the exact question text combined with the topic. If a match is found, it updates; if not, it inserts as new.

### Exporting to a custom path

```bash
npm run export:questions -- <subject-slug> <output-file>

# Example — export to a review folder
npm run export:questions -- microsoft-office src/database/seeds/review/questions-ms-office-review.json
```

---

## §6 — Linking Cert Tracks to Subject Tracks

Subject track ↔ certification track links are managed in [`seeds/seeders/08-certification-track-subject-track.seeder.ts`](seeds/seeders/08-certification-track-subject-track.seeder.ts).

To link via the API instead (e.g. after adding subject tracks manually):

```
POST /apis/certification-tracks/:id/subject-tracks
Body: { "subjectTrackIds": [1, 2, 3] }
```

Use `GET /apis/certification-tracks/by-job-role/:jobRoleId` to find cert track IDs first.

---

## File Structure

```
src/database/
├── data-source.ts                           Standalone TypeORM DataSource (used by all scripts)
├── README.md                                This file
├── scripts/
│   ├── import-curriculum.ts                 ← npm run import:curriculum
│   ├── import-questions.ts                  ← npm run import:questions [--update]
│   └── export-questions.ts                  ← npm run export:questions
└── seeds/
    ├── seed.ts                              Main orchestrator — npm run seed
    ├── tailwind-curriculum.json             Tailwind CSS curriculum (14 topics, 3 tracks)
    ├── computer-fundamentals-curriculum.json
    ├── internet-digital-curriculum.json
    ├── microsoft-office-curriculum.json
    ├── data-entry-curriculum.json
    ├── questions-computer-fundamentals.json  72 trivia questions (also used for export/update)
    ├── questions-internet-digital.json       60 trivia questions
    ├── questions-microsoft-office.json       96 trivia questions
    ├── questions-data-entry.json             60 trivia questions
    ├── questions-cloud-basics.json           8 general questions for Cloud Engineer readiness
    └── seeders/
        ├── 01-subject.seeder.ts             Reference only — subjects managed via API
        ├── 02-job-role.seeder.ts            ✅ Run — upserts 27 canonical job roles
        ├── 03-topic.seeder.ts               Reference only — topics managed via import:curriculum
        ├── 04-subject-track.seeder.ts       ✅ Run — inserts JS, TS, Python subject tracks
        ├── 05-subject-track-topic.seeder.ts ✅ Run — topic-to-track links
        ├── 06-job-role-subject.seeder.ts    ✅ Run — CLEARS + re-inserts 243 job role ↔ subject links
        ├── 07-certification-track.seeder.ts ✅ Run — CLEARS + re-inserts 54 cert tracks
        └── 08-certification-track-subject-track.seeder.ts  ✅ Run — cert ↔ subject track links
```

---

## Technical Details

### Seeder behaviour

- Runs with `synchronize: false` — never alters the database schema
- Executes via `ts-node` — does not bootstrap the NestJS application
- Uses the same `AppDataSource` as the import scripts
- **Job roles** — upserted (insert or update title/scope/color/orderId on existing)
- **Job role subjects** — destructively replaced on every run
- **Subject tracks** — insert-only (skip if exists)
- **Certification tracks** — destructively replaced on every run
- **Cert ↔ subject track links** — always inserted fresh (cert tracks cleared by seeder 07 first)

### Import script behaviour

| Script | Match key | On match | On no match |
|---|---|---|---|
| `import:curriculum` topics | `subjectId + title` | Skip | Insert |
| `import:curriculum` tracks | `subjectId + title` | Skip | Insert |
| `import:questions` (default) | `topicId + question text` | Skip | Insert |
| `import:questions --update` | `slug` (preferred) then `topicId + question text` | Update in-place | Insert |
| `export:questions` | — | Exports all questions for subject to JSON | — |

### Slug rules

| Entity | Uniqueness | Generated by |
|---|---|---|
| Subject | Global unique | API (on create) |
| Topic | Global unique | API or `import:curriculum` |
| SubjectTrack | Global unique | API or `import:curriculum` |
| JobRole | Global unique | Manual (seeder file) |
| Question | Global unique, max 48 chars | `import:questions` (auto-generated, never changed) |
| CertificationTrack | No slug | — |

### Enum reference

| Field | Allowed values |
|---|---|
| `topic.label` | `Foundation`, `Intermediate`, `Advanced` |
| `jobRoleSubject.tag` | `MANDATORY`, `RECOMMENDED`, `OPTIONAL` |
| `question.questionType` | `General`, `Trivia`, `Survey` |
| `question.status` | `Pending`, `Active`, `Inactive` |
| `certificate.status` | `ISSUED`, `REVOKED`, `EXPIRED` |

### Credentials & environment

The `data-source.ts` reads env vars first, then falls back to hardcoded dev defaults. **Empty string is honoured** — setting `DB_PASSWORD=` in `.env` connects with no password (common for local XAMPP/WAMP root).

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

**`npm run seed` wipes my cert tracks or job role subjects** — This is by design. Seeders 06 and 07 are destructive. Add any new cert tracks or job role links to the seeder files, not via the API.

**`import:curriculum` silently skips topics** — A topic with the same `(subjectId, title)` already exists. This is idempotent behaviour, not an error. To update a topic's description or goal, edit it via the API or use the DB directly.

**`import:questions` silently skips questions** — Same topic + same question text already exists. Run with `--update` if you want to apply edits, or use `export:questions` first to get a file with slugs.

**Questions updated with `--update` but options look wrong** — Option order in the JSON must match the original insertion order. The export preserves this order — always edit the exported file rather than reordering options manually.

**Import fails with "Subject not found"** — The `subjectSlug` in your JSON does not match the `slug` column in the `subject` table. Run `SELECT id, title, slug FROM subject` to verify.

**Topic links missing after import** — A title in `topicTitles` does not exactly match a topic title (case-sensitive). Run `SELECT title FROM topic WHERE subjectId = ?` to verify exact strings.

**`npm run seed` fails with access denied** — Check your `.env` file. `DB_PASSWORD=` (empty string, not omitted) is required for local MySQL root with no password.

**Questions import fails with "Topic not found"** — You need to run `import:curriculum` for the subject before `import:questions`. Topics must exist in the DB first.
