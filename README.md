# Dayavi (დაყავი)

> **Portfolio-Grade, Full-Stack Task & Project Management Platform**  
> Engineered with Next.js 16, React 19, TypeScript, PostgreSQL (Neon), Prisma ORM, Auth.js (NextAuth v5), and Tailwind CSS.

---

## 🇬🇪 Origin & Philosophy

**Dayavi** is named after the Georgian word **დაყავი** (*dayavi*), which means **"divide"**, **"break down"**, or **"partition"**.

Solving complex engineering, design, and product initiatives begins with breaking down monumental goals into clear, actionable, and prioritized units:
$$\text{Workspace} \longrightarrow \text{Project} \longrightarrow \text{Board} \longrightarrow \text{Column} \longrightarrow \text{Task}$$

Dayavi combines this organizational rigor with a **Playful Editorial & Soft Neo-Brutalist design language**:
* **"Playful outside, calm inside"**: Expressive, warm cream paper surfaces (`#FDFBF7`), structural ink borders, and retro offset shadows across overviews, paired with laser-focused, high-density productivity environments for deep work.
* **100% Native Next.js Architecture**: Zero external backend services, zero unvetted dependencies. Complete server-side authorization guards, transactional database mutations, and strict Zod boundary validation.

---

## ✨ Features at a Glance

* 🏢 **Multi-Tenant Workspaces**: Switch between workspaces seamlessly with granular RBAC permissions (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
* 📁 **Project Initiatives**: Comprehensive project lifecycle (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`) with dedicated boards and member access.
* 🗂️ **5 Unified Lenses (Views)**:
  1. **Kanban Board**: Accessible drag-and-drop (`@dnd-kit`), column WIP limits, floating order indexing, and keyboard reordering fallback.
  2. **Dense List View**: Power-user table with multi-select checkboxes, sortable columns, and instant bulk operations.
  3. **Calendar Schedule**: Monthly and weekly view organizing tasks by start and due dates.
  4. **Analytics Dashboard**: Real-time SQL-backed velocity metrics, member workload, status distribution, and bottleneck analysis.
  5. **My Tasks**: Cross-project personal triage categorized into *Today*, *Overdue*, *Upcoming*, and *Completed*.
* 📝 **Task Detail Drawer**: Deep-linkable slide-over drawer (`?taskId=...`) with inline editing, checklist subtasks with progress tracking (`3/5`), live time tracking stopwatch & manual logs, DAG dependency cycle prevention, threaded comments, and immutable audit timelines.
* ⚡ **Productivity Power Suite**:
  - Global Command Palette (`Cmd + K` / `Ctrl + K`).
  - Real-time fuzzy search across tasks, projects, boards, and labels.
  - Keyboard shortcuts (`?`).
  - Optimistic UI updates with instant 5-second Undo toast.
* 🔔 **Notification Center & Email Abstraction**: In-app unread alerts paired with a modular `EmailService` supporting Resend/SMTP in production and console logging in development.
* 🔒 **Secure Auth.js v5**: Credentials authentication (bcrypt-hashed), Google OAuth, GitHub OAuth, email verification, password reset, and protected middleware routes.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
* **Language**: TypeScript 5 (Strict mode)
* **UI & Styling**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Soft Neo-Brutalist tokens
* **Database**: PostgreSQL on [Neon.tech](https://neon.tech)
* **ORM**: Prisma ORM
* **Authentication**: Auth.js v5 (NextAuth)
* **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
* **Validation**: Zod
* **Testing**: Vitest, Playwright

---

## 🚀 Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/mghebro/dayavi.git
cd dayavi
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Populate `.env` with your Neon connection strings and Auth secret (refer to [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)).

### 3. Database Migration & Seed
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Accounts

The seed script initializes full demonstration data with the following test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Workspace Owner** | `giorgi@dayavi.app` | `Dayavi2026!` |
| **Admin** | `alex@dayavi.app` | `Dayavi2026!` |
| **Member** | `maria@dayavi.app` | `Dayavi2026!` |
| **Viewer** | `david@dayavi.app` | `Dayavi2026!` |

---

## 📚 Architectural Documentation

Comprehensive technical specifications are available in the [`docs/`](docs/) directory:
* [Product Specification](docs/PRODUCT.md)
* [System Architecture](docs/ARCHITECTURE.md)
* [Database & Schema](docs/DATABASE.md)
* [Authentication Model](docs/AUTHENTICATION.md)
* [Authorization & RBAC](docs/AUTHORIZATION.md)
* [UI/UX Design System](docs/UX.md)
* [Routing & URL State](docs/ROUTING.md)
* [Component Architecture](docs/COMPONENTS.md)
* [Notifications & Email](docs/NOTIFICATIONS.md)
* [Analytics & Metrics](docs/ANALYTICS.md)
* [Testing & QA Strategy](docs/TESTING.md)
* [Development & Deployment](docs/DEVELOPMENT.md)

---

## 📄 License
MIT © Giorgi Mgebrishvili
