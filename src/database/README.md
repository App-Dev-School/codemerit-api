# Database Seeder & Content Import

This document covers how to seed the database for the first time and how to import AI-generated curriculum and question content on an ongoing basis.

---

## Quick Reference — What Do You Want to Do?

| Task | Command | File to prepare |
|---|---|---|
| Seed SubjectTracks & CertificationTracks (first time) | `npm run seed` | Update slug maps (see §3) |
| Import AI-generated topics + tracks | `npm run import:curriculum -- <file.json>` | `curriculum.json` |
| Import AI-generated questions | `npm run import:questions -- <file.json>` | `questions.json` |

---

## Step-by-Step Instructions

### Step 1 — First-time DB seeding

This seeds `SubjectTrack`, `CertificationTrack`, and their pivot tables.  
Your existing **Subjects, JobRoles, and Topics are not touched** — they are fetched from the DB as-is.

**Before running, do two things:**

1. Open [`seeds/seeders/04-subject-track.seeder.ts`](seeds/seeders/04-subject-track.seeder.ts) and confirm the `subjectSlug` values in `SUBJECT_TRACKS` match the actual `slug` column values in your `subject` table.

2. Open [`seeds/seeders/05-subject-track-topic.seeder.ts`](seeds/seeders/05-subject-track-topic.seeder.ts) and update `TRACK_TOPIC_MAP` to use your actual topic slugs (from the `topic` table).

Then run:

```bash
npm run seed
```

The seeder is **idempotent** — safe to run multiple times. It skips records that already exist.

---

### Step 2 — Generating content with an AI tool

Use the following prompt template when asking an AI to generate content.  
Always specify the subject, existing topics, and what you need.

**For curriculum (topics + tracks):**

```
You are a curriculum designer for a tech learning platform called CodeMerit.

Subject: <subject name>
Existing topics: <comma-separated list>
Job Role context: <job role name if relevant>
Difficulty spread: 40% Foundation, 40% Intermediate, 20% Advanced

Generate <N> new topics for this subject.
Then group them into <N> subject tracks.

Output ONLY valid JSON in the curriculum format below. No explanation.
```

**For questions:**

```
You are a question author for a tech assessment platform called CodeMerit.

Subject: <subject name>
Topic: <topic title>
Difficulty: <Foundation | Intermediate | Advanced>

Generate <N> multiple-choice Trivia questions for this topic.
Each question must have exactly 4 options, 1 correct.

Output ONLY valid JSON in the questions format below. No explanation.
```

---

### Step 3 — Importing curriculum (Phase 1)

Save the AI output as a `.json` file (e.g. `javascript-curriculum.json`) and run:

```bash
npm run import:curriculum -- javascript-curriculum.json
```

**Expected JSON format:**

```json
{
  "subjectSlug": "javascript",
  "topics": [
    {
      "title": "Closures in Depth",
      "description": "Explores how closures capture variables from outer scopes and their use in patterns like memoisation and module design.",
      "goal": "Understand how closures work and apply them to real-world patterns.",
      "label": "Intermediate",
      "order": 9,
      "weight": 2,
      "isPublished": true
    }
  ],
  "subjectTracks": [
    {
      "title": "JS Closures Track",
      "description": "A focused track on lexical scope and closure patterns.",
      "sortOrder": 3,
      "isPublished": true,
      "topicTitles": ["Closures in Depth", "Functions & Closures"]
    }
  ]
}
```

> **Note:** `topicTitles` inside `subjectTracks` must exactly match the `title` of a topic — either one that already exists in the DB or one defined in the same JSON file's `topics` array.

---

### Step 4 — Importing questions (Phase 2)

Always run this **after** curriculum import so the topic IDs exist in the DB.

```bash
npm run import:questions -- javascript-questions.json
```

**Expected JSON format:**

```json
{
  "subjectSlug": "javascript",
  "questions": [
    {
      "topicTitle": "Closures in Depth",
      "question": "What does a closure capture from its outer scope?",
      "level": 2,
      "timeAllowed": 75,
      "options": [
        {
          "option": "A reference to variables, not a copy of their values",
          "correct": true,
          "comment": "Correct. The closure holds a live reference, not a snapshot."
        },
        {
          "option": "A snapshot of all variable values at the time of creation",
          "correct": false
        },
        {
          "option": "Only primitive values — objects are excluded",
          "correct": false
        },
        {
          "option": "Nothing — closures are stateless by design",
          "correct": false
        }
      ]
    }
  ]
}
```

> **Rules:**  
> - `topicTitle` must match an existing topic title in the DB (for the given subject).  
> - Every question must have **exactly 4 options** with **exactly 1** having `correct: true`.  
> - `level` is `1` (Foundation), `2` (Intermediate), or `3` (Advanced).  
> - `timeAllowed` is in seconds (e.g. `60`, `75`, `90`).

---

### Step 5 — Linking tracks to CertificationTracks (via API)

Once subject tracks exist, link them to certification tracks using the API:

```
POST /apis/certification-tracks/:id/subject-tracks
Body: { "subjectTrackIds": [1, 2, 3] }
```

Use `GET /apis/certification-tracks/by-job-role/:jobRoleId` to find the right certification track IDs first.

---

## File Structure

```
src/database/
├── data-source.ts                   Standalone TypeORM DataSource for seeder/import scripts
├── README.md                        This file
└── seeds/
    ├── seed.ts                      Main orchestrator — run with `npm run seed`
    └── seeders/
        ├── 01-subject.seeder.ts     Reference data (not run — subjects fetched from DB)
        ├── 02-job-role.seeder.ts    Reference data (not run — job roles fetched from DB)
        ├── 03-topic.seeder.ts       Reference data (not run — topics fetched from DB)
        ├── 04-subject-track.seeder.ts      ← Update subjectSlug values before first run
        ├── 05-subject-track-topic.seeder.ts ← Update TRACK_TOPIC_MAP before first run
        ├── 06-job-role-subject.seeder.ts
        ├── 07-certification-track.seeder.ts
        ├── 08-certification-track-subject-track.seeder.ts
        └── 09-question.seeder.ts    Reference data (not run)
```

---

## Technical Details

### How the seeder works

The seeder (`npm run seed`) is a standalone TypeScript script executed directly by `ts-node`. It does **not** bootstrap the NestJS application — it creates its own TypeORM `DataSource` connection defined in `data-source.ts`, which mirrors the same credentials as `TypeormConfigService`.

It runs with `synchronize: false` — the seeder never alters the schema.

Execution order matches FK dependencies:

```
Subject / JobRole / Topic  ← fetched from DB (already exist)
        ↓
SubjectTrack               (requires subjectId)
        ↓
SubjectTrackTopic           (requires subjectTrackId + topicId)
        ↓
JobRoleSubject              (requires jobRoleId + subjectId)
        ↓
CertificationTrack          (requires jobRoleId)
        ↓
CertificationTrackSubjectTrack  (requires certificationTrackId + subjectTrackId)
```

### How import scripts work

Import scripts (`npm run import:curriculum`, `npm run import:questions`) follow the same direct-DB pattern as the seeder — no HTTP, no running server, no auth tokens required.

Each script:
1. Reads the JSON file passed as a CLI argument
2. Initialises the same `AppDataSource`
3. Looks up parent entities by slug/title (e.g. finds `subjectId` from `subjectSlug`)
4. Inserts records using TypeORM repositories
5. Is idempotent — skips records that already exist (matched by slug or title+subjectId)

### Slug rules

| Entity | Slug uniqueness | Auto-generated? |
|---|---|---|
| Subject | Global unique | Yes (on create via API) |
| Topic | Global unique | Yes (on create via API or import) |
| SubjectTrack | Global unique | Yes (on create via API or import) |
| Question | Global unique, max 50 chars | Yes (on create via API or import) |
| JobRole | Global unique | Manual |
| CertificationTrack | No slug | — |

The import script generates slugs using the same `generateSlug` / `generateUniqueSlug` utility at `src/common/utils/slugify.util.ts`.

### Enum reference

| Field | Allowed values |
|---|---|
| `topic.label` | `Foundation`, `Intermediate`, `Advanced` |
| `jobRoleSubject.tag` | `MANDATORY`, `OPTIONAL`, `RECOMMENDED` |
| `question.questionType` | `General`, `Trivia`, `Survey` |
| `question.status` | `Pending`, `Active`, `Inactive` |
| `certificate.status` | `ISSUED`, `REVOKED`, `EXPIRED` |

### Credentials & environment

The `data-source.ts` reads from environment variables first, then falls back to hardcoded local dev credentials:

| Variable | Default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USERNAME` | `codemerituser` |
| `DB_PASSWORD` | `GwjU067FL8hcmjQkXjaM` |
| `DB_DATABASE` | `codemeritdb` |

Set these in a `.env` file at the project root before running in any non-local environment.

### API endpoints for manual content management

All endpoints follow the pattern `{BASE_URL}/apis/{resource}/{action}`.  
Protected routes require a JWT Bearer token in the `Authorization` header.

**Subject Tracks**

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/apis/subject-tracks/create` | Required | Create a subject track |
| `GET` | `/apis/subject-tracks/all` | Required | List all tracks |
| `GET` | `/apis/subject-tracks/by-subject/:subjectId` | Public | Tracks for a subject |
| `GET` | `/apis/subject-tracks/:id` | Public | Single track with topics |
| `PUT` | `/apis/subject-tracks/update/:id` | Required | Update track |
| `DELETE` | `/apis/subject-tracks/delete/:id` | Required | Delete track |
| `POST` | `/apis/subject-tracks/:id/topics` | Required | Link topics `{ topicIds: [] }` |
| `DELETE` | `/apis/subject-tracks/:id/topics/:topicId` | Required | Unlink a topic |

**Certification Tracks**

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/apis/certification-tracks/create` | Required | Create a certification track |
| `GET` | `/apis/certification-tracks/all` | Required | List all cert tracks |
| `GET` | `/apis/certification-tracks/by-job-role/:jobRoleId` | Public | Tracks for a job role |
| `GET` | `/apis/certification-tracks/:id` | Public | Single track with subject tracks |
| `PUT` | `/apis/certification-tracks/update/:id` | Required | Update cert track |
| `DELETE` | `/apis/certification-tracks/delete/:id` | Required | Delete cert track |
| `POST` | `/apis/certification-tracks/:id/subject-tracks` | Required | Link subject tracks `{ subjectTrackIds: [] }` |
| `DELETE` | `/apis/certification-tracks/:id/subject-tracks/:subjectTrackId` | Required | Unlink a subject track |

**Topics** (existing)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/apis/topics/create` | Public | Create a topic |
| `GET` | `/apis/topics/all` | Required | List all topics |
| `GET` | `/apis/topics/by-subject/:subjectId` | Public | Topics for a subject |
| `PUT` | `/apis/topics/update/:topicId` | Public | Update a topic |
| `DELETE` | `/apis/topics/delete/:topicId` | Public | Delete a topic |

---

## Common Mistakes

**Seeder silently skips subject tracks** — the `subjectSlug` in the seeder doesn't match the actual slug in your `subject` table. Check with `SELECT slug FROM subject`.

**Import fails on topic lookup** — `topicTitle` in the questions JSON doesn't exactly match the title in the DB (case-sensitive). Use `SELECT title FROM topic WHERE subject_id = ?` to verify.

**Unique constraint error on slug** — a topic or subject track with the same slug already exists. The import script will skip it automatically, but if you need to overwrite, delete the existing record first.

**Questions import before curriculum** — topic IDs don't exist yet. Always run `import:curriculum` before `import:questions` for new topics.
