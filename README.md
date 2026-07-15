Here's the complete project summary:

---

## TrackVim — Tech Stack Summary

### Framework & Language

- **Next.js 15** (App Router) — fullstack framework, server components, API routes
- **TypeScript** — type safety across the entire codebase
- **React 19** — UI layer

---

### Database

- **Neon** — serverless Postgres, edge-compatible
- **Drizzle ORM** — type-safe queries, migrations
- **drizzle-kit** — migration CLI (`drizzle-kit push`, `drizzle-kit generate`)
- **drizzle-zod** — auto-generate Zod schemas from Drizzle tables

---

### Auth

- **Clerk** — authentication, sessions, role management (owner / trainer / member stored in `publicMetadata`)

---

### Server State & Data Fetching

- **TanStack React Query** — client-side fetching, caching, background refetch, mutations
- **React Query Devtools** — dev-only query inspector

---

### Validation & Forms

- **Zod** — schema validation on API routes and forms
- **React Hook Form** — form state management, minimal re-renders
- **@hookform/resolvers** — connects RHF with Zod via `zodResolver`

---

### UI & Styling

- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library (Nova preset — Lucide + Geist)
- **Lucide React** — icons
- **clsx + tailwind-merge** — conditional class merging
- **class-variance-authority** — variant-based component styling
- **Geist font** — sans + mono via `next/font/google`

---

### QR System

- **qrcode.react** — generates QR code per member (UUID-based)
- **jsqr** — decodes QR from webcam frame on scanner page

---

### Tables

- **TanStack React Table** — headless table for members, attendance, payment lists

---

### Date & Time

- **date-fns** — date formatting, expiry checks, attendance grouping

---

### Notifications

- **Sonner** — toast notifications (`toast.success`, `toast.error`)

---

### Dev Tools

- **ESLint + eslint-config-next** — linting
- **Prettier + prettier-plugin-tailwindcss** — formatting, auto-sorts Tailwind classes

---

### Hosting & Deployment

- **Vercel** — deployment, edge network, pairs natively with Next.js + Neon

---

### What is NOT included (intentional MVP cuts)

- No payment gateway — cash is marked manually by owner
- No push notifications / email
- No PDF invoice generation
- No exercise library in v1 — sessions are type (leg/push/pull) + notes only
- No bulk member import

---
