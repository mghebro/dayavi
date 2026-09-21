# Dayavi (დაყავი) — UI/UX Design System & Experience Direction

## 1. Visual Identity: Playful Editorial & Soft Neo-Brutalism

Dayavi features a distinct, human-designed aesthetic that blends **playful modern editorial design** with **soft neo-brutalism**. It rejects cookie-cutter AI SaaS templates, generic purple/blue gradients, and sterile enterprise tables in favor of warmth, tactility, and craft.

### The Guiding UX Philosophy: *"Playful Outside, Calm Inside"*
* **Outside (Dashboard, Onboarding, Authentication, Public Pages)**: Expressive, asymmetric compositions, warm cream surfaces, bold editorial greetings, hand-drawn decorative geometry (stars, dots, arrows), and inviting color accents.
* **Inside (Kanban, List, Calendar, Task Detail)**: Focused, distraction-free, high-density productivity environments. The playful personality transitions into subtle accent markers, project color tags, and microinteractions, ensuring zero visual fatigue during 8-hour workdays.

---

## 2. Color Palette & Distribution

| Role | Name | Hex Token | Visual Intent & Usage |
| :--- | :--- | :--- | :--- |
| **Base Surface** | Paper Cream | `#FDFBF7` | Main canvas background, comforting and warm. |
| **Secondary Surface**| Warm Sand | `#F5F2EB` | Sidebar, column containers, secondary panels. |
| **Content Surface** | Pure White | `#FFFFFF` | Task cards, modal windows, slide-over drawer. |
| **Text Primary** | Deep Ink | `#18181B` | High contrast, ultra-scannable typography. |
| **Text Muted** | Charcoal | `#71717A` | Metadata, timestamps, helper text. |
| **Border / Stroke** | Ink Border | `#27272A` | Crisp 1.5px structural borders. |
| **Accent Primary** | Coral Orange | `#FF6B4A` | Primary CTA, urgent priority, action buttons. |
| **Accent Workspace** | Soft Lavender | `#E0D8FF` | Project tags, workspace identifiers, subtle highlights. |
| **Accent Attention** | Butter Yellow | `#FEF08A` | High priority, WIP limit warnings, active chips. |
| **Accent Success** | Muted Sage | `#D1FAE5` | Completed tasks, progress meters, success toasts. |

### Color Balance Ratio:
* **60%** Neutral Paper & Sand
* **20%** Content White
* **10%** Dark Ink Structure & Borders
* **5%** Coral Orange Highlights
* **5%** Lavender, Yellow & Sage Accents

---

## 3. Shape, Border & Shadow Architecture

### 3.1 Radii Hierarchy
To avoid the monotonous look of uniform rounding across every UI element:
* **Large Surfaces & Modals**: `rounded-2xl` (20px–24px) for friendly containers.
* **Task Cards & Panels**: `rounded-xl` (14px–16px) for distinct tangible cards.
* **Buttons, Badges & Inputs**: `rounded-lg` (8px–10px) for precise interactive controls.

### 3.2 Tactile Offset Shadows
Soft neo-brutalism is introduced via subtle, hard-edged offset shadows rather than muddy Gaussian blurs:
* **Standard Card**: `shadow-[2px_2px_0px_0px_#18181b]`
* **Interactive Button**: `shadow-[2px_2px_0px_0px_#18181b]` with active state `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`
* **Modal / Drawer**: `shadow-[4px_4px_0px_0px_#18181b]`

---

## 4. Typography Hierarchy

* **Display Headings (`h1`, `h2`)**: Expressive, punchy, rounded display typography with generous letterforms and strong weight contrast.
* **Section Headers (`h3`, `h4`)**: Bold editorial labels with clear uppercase tracking (`tracking-wide`).
* **Body & Metadata**: Highly legible geometric sans-serif (`font-sans`) optimized for dense lists and small task tokens.

---

## 5. View-Specific UX Specifications

### 5.1 Workspace Dashboard
* Editorial greeting: *"Good morning, [User]"* or *"Let's get things moving"*.
* **Today's Focus**: Prominent asymmetric card highlighting overdue, due today, and urgent tasks.
* **Project Collection**: Varied editorial cards with progress rings and activity tags.
* **Team Activity Timeline**: Compact chronological feed of team accomplishments.

### 5.2 Kanban Board
* Multi-column workflow (`Backlog`, `Todo`, `In Progress`, `Review`, `Done`).
* Tactile column headers with task counts and WIP limits.
* Accessible drag-and-drop powered by `@dnd-kit` with smooth keyboard navigation fallback.
* Quick task creation: Instant single-field "+ New Task" input at the bottom of each column.

### 5.3 Task Detail Drawer
* Opens as a deep-linkable slide-over drawer (`?taskId=XYZ`) keeping board context visible.
* Inline click-to-edit for title and markdown description.
* Subtasks checklist with instant optimistic progress updates (`3/5 completed`).
* Built-in live time tracking widget (start, stop, manual entry).
* Dependencies section with cycle-detection warnings.
* Activity feed and threaded comments.

---

## 6. Accessibility & Motion Guidelines

* **Target**: WCAG 2.2 AA compliance.
* **Focus States**: Explicit, high-contrast keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2`).
* **Reduced Motion**: All animations wrap within `@media (prefers-reduced-motion: reduce)` to disable transitions for users with vestibular sensitivities.
* **Drag-and-Drop Alternatives**: Every task card includes a dropdown menu option ("Move to Column...") ensuring screen reader and keyboard-only users can reorder tasks without pointer devices.
