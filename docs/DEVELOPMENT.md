# Dayavi (დაყავი) — Developer Guide & Setup

## 1. Prerequisites

* **Node.js**: $\ge 20.0.0$ (Node v24.x recommended)
* **Package Manager**: `npm` ($\ge 10$) or `pnpm` ($\ge 9$)
* **Database**: PostgreSQL (Cloud database on [Neon.tech](https://neon.tech) or local PostgreSQL instance)

---

## 2. Quickstart Guide

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/mghebro/dayavi.git
cd dayavi
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/dayavi?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/dayavi?sslmode=require"

# Auth.js (NextAuth v5)
AUTH_SECRET="your-super-secret-random-32-character-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional Social OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email Service (Optional for Production; defaults to console in Dev)
RESEND_API_KEY=""
EMAIL_FROM="Dayavi <notifications@dayavi.app>"
```

### Step 3: Database Setup & Seed
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database / run migrations
npm run db:push

# Populate database with rich demo data
npm run db:seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Demo Credentials

The database seed script automatically provisions demo accounts for exploration:

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo Owner** | `giorgi@dayavi.app` | `Dayavi2026!` | Workspace Owner |
| **Demo Admin** | `alex@dayavi.app` | `Dayavi2026!` | Admin |
| **Demo Member** | `maria@dayavi.app` | `Dayavi2026!` | Member |
| **Demo Viewer** | `david@dayavi.app` | `Dayavi2026!` | Viewer |

---

## 4. Package Scripts Reference

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Launches local development server on port 3000. |
| `npm run build` | `next build` | Compiles optimized production build. |
| `npm run start` | `next start` | Starts production server. |
| `npm run lint` | `next lint` | Runs ESLint analysis across codebase. |
| `npm run typecheck` | `tsc --noEmit` | Runs full TypeScript static type checking. |
| `npm run test` | `vitest run` | Executes all unit and integration tests. |
| `npm run test:watch` | `vitest` | Runs Vitest in interactive watch mode. |
| `npm run db:generate`| `prisma generate`| Regenerates Prisma Client types. |
| `npm run db:push` | `prisma db push`| Synchronizes Prisma schema directly to database. |
| `npm run db:seed` | `tsx prisma/seed.ts`| Seeds database with demo workspaces, tasks, and users. |

---

## 5. Deployment Guide (Vercel + Neon)

1. **Database Setup on Neon**:
   - Create a project on [Neon.tech](https://neon.tech).
   - Copy the Pooled connection string as `DATABASE_URL`.
   - Copy the Direct connection string as `DIRECT_URL`.
2. **Deploy to Vercel**:
   - Import the `dayavi` repository into Vercel.
   - Set Framework Preset to **Next.js**.
   - Add Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`).
   - Run `npx prisma db push` during build or in the Neon console.
   - Deploy!
