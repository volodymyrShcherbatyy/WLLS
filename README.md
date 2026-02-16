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

## Learning Algorithm

Word selection priority (`lib/learning.ts`):
1. Lowest `masteryLevel`
2. Never reviewed (`lastReviewedAt` is null)
3. Oldest `lastReviewedAt`

Batch size: 10 words.

## Project Structure

- `app/` - App Router pages and route handlers
- `components/` - reusable UI components
- `lib/` - auth, DB client, learning logic
- `prisma/` - schema and seed script
- `types/` - NextAuth module augmentation
