# WLLS MVP (Word Language Learning Service)

Production-ready MVP built with Next.js App Router, Tailwind CSS, Prisma, PostgreSQL, NextAuth, and TypeScript.

## Features

- Email/password authentication with NextAuth Credentials provider.
- User profiles with native/target language selection.
- Vocabulary system with words, images, translations, and difficulty levels.
- Sentence linking model for contextual learning.
- Progress tracking with mastery levels (0-5).
- Test engine:
  - Multiple choice: Word → Translation.
  - Input test: Translation → Word.
- Library endpoints and pages for learned/mastered/in-progress words.
- Basic admin CRUD page for words and translation linking.
- Custom user word lists that prioritize selected words in learning and test generation.

## Functional & UX Refactor

- Navbar now displays learner name and learning language pair (`native / target`).
- Learn page uses responsive card grid (`1/2/3` columns for mobile/tablet/desktop).
- Translation line on learn cards is redesigned as a merged horizontal row: `description="word" >>> "translation"`.
- Multiple choice tests now validate instantly on option click, remove manual submit, and keep `/api/tests/submit` grading flow.
- Multiple choice feedback colors are immediate: correct answers are green and wrong selections are red while also revealing the correct option.

## Tech Stack

- Next.js 14 (App Router)
- React + Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth.js
- TypeScript

## 1) Install dependencies

```bash
npm install
```

## 2) Environment setup

Copy `.env.example` to `.env` and configure values:

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL`: PostgreSQL connection string.
- `NEXTAUTH_URL`: base URL (http://localhost:3000 for local dev).
- `NEXTAUTH_SECRET`: random secure secret.

## 3) Prisma migration

```bash
npx prisma migrate dev --name init
# custom lists migration (already included in this repo)
npx prisma migrate dev --name custom_lists
# spaced repetition fields migration
npx prisma migrate dev --name add_srs_fields
```

## 4) Seed database

```bash
npx prisma db seed
```

Seed creates:
- 3 languages (Ukrainian, English, Swedish)
- 15 words + bidirectional translations
- 4 sentences + word links
- Demo learner + admin users
- Starter progress records

Demo credentials:
- Learner: `learner@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## 5) Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

- `GET /api/languages`
- `GET /api/words`
- `POST /api/words` (admin only)
- `GET /api/tests/generate?type=mcq|input`
- `POST /api/tests/submit`
- `GET /api/progress`
- `GET /api/library`
- `GET /api/lists`
- `POST /api/lists`
- `GET /api/lists/:id`
- `POST /api/lists/:id/words`
- `DELETE /api/lists/:id/words/:wordId`
- `POST /api/lists/:id/user-words`
- `DELETE /api/lists/:id/user-words/:wordId`

## Learning Algorithm

Word selection priority (`lib/learning.ts`):
1. words in custom lists
2. words due for review (`nextReviewAt <= now`)
3. unseen/new words
4. fallback low mastery and older scheduling dates

Batch size: 10 words.

## Spaced Repetition System

The platform now uses an SM-2 Lite scheduler on each test submission.

- Correct answers map to quality `5`, wrong answers map to quality `2`.
- If quality is below `3`, repetitions are reset to `0` and interval to `1` day.
- If quality is `3` or higher:
  - first successful repetition → interval `1` day
  - second successful repetition → interval `6` days
  - later repetitions → interval multiplied by ease factor (rounded)
- Ease factor is updated every review and clamped to a minimum of `1.3`.
- `nextReviewAt` is set to `now + interval days` and used by learning priority and library views.

Learning priority now follows:
1. words in custom lists
2. words due for review (`nextReviewAt <= now`)
3. unseen/new words
4. fallback low mastery and older scheduling dates

## Project Structure

- `app/` - App Router pages and route handlers
- `components/` - reusable UI components
- `lib/` - auth, DB client, learning logic
- `prisma/` - schema and seed script
- `types/` - NextAuth module augmentation

## Custom Lists Usage

1. Open `/lists` and create a list.
2. Open a list and add words from the global vocabulary pool or create private user-owned words directly in the list modal.
3. Added words are surfaced first in `/learn` and `/api/tests/generate` because test generation reuses learning priority order.

Example API call:

```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name":"Travel words"}'
```

## User-Owned Vocabulary

User-owned vocabulary is stored separately from admin-managed global words.

- **Global vocabulary** remains in the `Word` + `Translation` tables and is controlled by admins.
- **User-owned vocabulary** lives in `UserWord` + `UserWordTranslation` and is private per user.
- List membership for user-owned words is stored via `CustomListUserWord`, while global words continue using `CustomListWord`.
- SRS progress for user-owned words is tracked in `UserWordProgress`; global words continue to use `Progress`.

Learning and testing now run against a merged pool of global words and user-owned words, while preserving existing behavior for legacy/global data and APIs.
