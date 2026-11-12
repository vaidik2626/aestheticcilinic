# Centro Estético Claudia Hernández — website & booking system

Premium editorial website for a beauty and aesthetic clinic in Bogotá, with a real
appointment booking system (PostgreSQL), a protected admin dashboard and WhatsApp
integration. Public content is in Spanish (Colombia).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5.9 · Tailwind CSS 4 ·
GSAP 3.15 + ScrollTrigger + SplitText · Framer Motion 14 · Lenis · Prisma 7
(`@prisma/adapter-pg`) · PostgreSQL · Zod 4 · Resend (optional) · bcryptjs.

---

## 1. Quick start (local)

Requirements: Node.js ≥ 20.9, a PostgreSQL database.

```bash
npm install                      # also runs `prisma generate`
cp .env.example .env             # fill in DATABASE_URL at minimum
npm run db:deploy                # apply migrations (incl. overlap constraint)
npm run db:seed                  # booking settings, example treatments, content, gallery
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password-123' npm run admin:create
npm run dev                      # http://localhost:3000  ·  admin: /admin
```

### No local PostgreSQL? Use `prisma dev`

```bash
npx prisma dev -n chdev -d       # prints a postgres://… URL
```

Put that URL in `DATABASE_URL` and set `DATABASE_POOL_MAX="1"` — the local
`prisma dev` server (PGlite) does not support concurrent connections. Leave
`DATABASE_POOL_MAX` empty with a real PostgreSQL server.

To try the booking flow locally with sample hours:

```bash
SEED_DEMO_AVAILABILITY=true npm run db:seed
```

This creates a **demo** weekly schedule and enables online booking. It is not the
clinic's real schedule — configure the real one in `/admin/disponibilidad`.

---

## 2. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. On Vercel use your provider's pooled URL. |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical URL without trailing slash. Used for SEO, sitemap, Open Graph, JSON-LD. |
| `RESEND_API_KEY` | no | Enables confirmation emails. |
| `EMAIL_FROM` | no | Verified Resend sender, e.g. `Centro Estético Claudia Hernández <citas@domain.com>`. |
| `CLINIC_NOTIFICATION_EMAIL` | no | Inbox that receives a notice for every new booking request. |
| `DATABASE_POOL_MAX` | no | Max pool connections. Use `1` with `prisma dev`; leave empty in production. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only for `admin:create` | Remove them from the environment afterwards. |

Without Resend, bookings are still saved; the confirmation screen tells the
customer that no email was sent. Nothing pretends otherwise.

---

## 3. Database & migrations

- Schema: `prisma/schema.prisma` · config: `prisma.config.ts` (Prisma 7 style).
- The generated client lives in `src/generated/prisma` (git-ignored, generated on install/build).
- The initial migration adds a PostgreSQL **`EXCLUDE USING gist`** constraint
  (`Booking_no_overlap`): no two *pending or confirmed* bookings can overlap in time,
  including the buffer between appointments. This is the last line of defence
  against race conditions.

| Command | What it does |
| --- | --- |
| `npm run db:deploy` | Apply migrations (use in production / CI). |
| `npm run db:migrate` | Create a new migration after editing the schema (development). |
| `npm run db:seed` | Idempotent seed: settings, example treatments, default content, gallery. |
| `npm run admin:create` | Create the admin, or reset its password (also signs out existing sessions). |

---

## 4. Admin dashboard (`/admin`)

There is **no public registration**. Accounts are created only with `npm run admin:create`
(min. 12 characters, bcrypt cost 12).

- **Resumen** — totals, pending/confirmed/completed, upcoming appointments, configuration warnings.
- **Reservas** — search (name, email, phone, reference), filter by status, treatment and date range;
  confirm / complete / cancel; booking detail with customer contact (WhatsApp/email) and internal notes.
- **Tratamientos** — create, edit, enable/disable, delete (a treatment that has bookings is deactivated instead, to keep history).
- **Disponibilidad** — weekly opening hours (several ranges per day), blocked days or time ranges,
  slot interval, buffer between appointments, minimum notice, booking horizon, online booking on/off.
- **Contenido** — contact details, homepage copy, Claudia's bio and portrait, gallery, testimonials.

Security: server-side authorization on every admin page **and** every server action
(`requireAdmin()`), DB-backed sessions (only a SHA-256 of the token is stored; httpOnly,
`SameSite=Lax`, `Secure` in production, 12 h), constant-time-ish login, DB-backed rate
limiting (login and booking), Zod validation everywhere, `noindex` on `/admin`.

---

## 5. Booking system

Flow at `/reservar`: **Service → Date → Time → Details → Summary → Confirmation**.

- Availability is computed server-side from weekly hours, blocked time, existing bookings,
  appointment duration, buffer, minimum notice and booking horizon (`src/lib/availability.ts`).
  All times are in Bogotá (UTC−5, no DST).
- Creating a booking (`src/lib/booking-service.ts`):
  1. Zod validation and a honeypot field.
  2. **Idempotency key** per wizard session — double clicks and retries return the same booking.
  3. Rate limit per IP (5 per hour).
  4. Transaction with `pg_advisory_xact_lock`, re-checks the slot is still offered, inserts.
  5. The `EXCLUDE` constraint rejects any overlap that slips through.
- New bookings are **`PENDING`**. Customers see "pending confirmation", never "confirmed".
  Statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.
- Confirmation screen: unique reference (`CH-XXXXXX`), summary, `.ics` download,
  Google Calendar link, WhatsApp follow-up message with the reference.
- No payment is taken, and the UI says so.
- **Fallback:** if online booking is disabled, has no hours configured, or the database
  is unreachable, `/reservar` switches to WhatsApp-assisted booking. Network or server
  errors during submission explicitly state the appointment was *not* saved and offer WhatsApp.

The model assumes **one appointment at a time** (single practitioner/room). For parallel
capacity, add a resource column and include it in the exclusion constraint.

Tested locally: idempotent retries, taken/overlapping slots (409), 6 concurrent requests
for one slot (exactly 1 created), validation, past slots, honeypot, rate limiting.

---

## 6. WhatsApp

`src/lib/whatsapp.ts` builds URL-encoded `wa.me` links with prefilled messages
(general, appointment, per category, post-booking with reference). The official link
`https://wa.link/o5z3fk` redirects to **+57 321 270 2791**, which is the default number
(editable in `/admin/contenido`).

---

## 7. Motion system

- **GSAP** — preloader, hero intro (clip-path reveal + SplitText lines), scroll reveals,
  parallax, the pinned editorial scene, the pinned horizontal journey (`/nuestra-experiencia`),
  footer wordmark. Everything is created inside `useGSAP` (automatic cleanup) and
  `gsap.matchMedia` (heavy effects only ≥ 1024 px).
- **Framer Motion** — mega menu, mobile menu, booking wizard steps, calendar, lightbox,
  FAQ accordion, magnetic buttons, page transitions (opacity only, so pinned sections keep working).
- **Lenis** — smooth scrolling driven by the GSAP ticker and synced with ScrollTrigger (`src/hooks/use-lenis.tsx`).
- `prefers-reduced-motion` disables Lenis, the preloader and the GSAP effects; content is
  shown immediately. The custom cursor label only exists on fine-pointer, hover-capable devices.

---

## 8. Content you must supply before launch

The site deliberately invents **no** certifications, degrees, years of experience,
prices, reviews, results or guarantees. Replace these placeholders:

- [ ] **Photography** — `public/images/*.jpg` are Unsplash stock placeholders (free licence).
      Replace files keeping the same names, or edit `src/data/images.ts`. The gallery is managed in the admin.
- [ ] **Claudia's portrait and bio** — `/admin/contenido` (texts starting with `[Pendiente]` are shown as marked placeholders).
- [ ] **Logo** — the "CH" monogram is a typographic placeholder designed for this site, not the official logo (`src/components/ui/logo.tsx`, `public/icon.svg`).
- [ ] **Treatments** — the seeded services are examples; edit names, descriptions and durations.
- [ ] **Opening hours & booking rules** — `/admin/disponibilidad`, then enable online booking.
- [ ] **Testimonials** — only real ones, first name only, with consent ticked.
- [ ] **Treatment benefits** — `benefits: []` in `src/data/treatments.ts`; the section stays hidden until the clinic validates a list.
- [ ] **"Por qué elegirnos" pillars** — `src/components/sections/why-us.tsx`; confirm with the clinic.
- [ ] **Legal pages** — `/politica-de-privacidad` and `/politica-de-reservas` are templates (Ley 1581 de 2012) to be reviewed by a legal advisor; the cancellation policy is marked `[Pendiente]`.

---

## 9. Deployment (Vercel)

1. Create a PostgreSQL database (Neon, Supabase, Prisma Postgres, …).
2. Import the repository in Vercel and set the environment variables (section 2).
3. Build command: `npm run build` (runs `prisma generate`). Apply migrations once against the
   production database — locally with the production `DATABASE_URL`, or in CI:
   `npm run db:deploy && npm run db:seed`.
4. Create the admin: `ADMIN_EMAIL=… ADMIN_PASSWORD=… DATABASE_URL=<prod> npm run admin:create`.
5. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy, so canonical URLs and the sitemap are correct.
6. Optional: verify a domain in Resend and set the email variables.

Public pages are statically generated with 5-minute revalidation; admin changes
revalidate them immediately. `/reservar`, `/admin` and the APIs are dynamic.

---

## 10. Project structure

```
prisma/              schema, migrations (with EXCLUDE constraint), seed
scripts/             create-admin.ts
src/app/(site)/      public pages: home, treatments (4 + index), about, experience,
                     contact, booking, legal, 404 · layout with header/footer/Lenis
src/app/admin/       login, protected panel (dashboard, bookings, treatments,
                     availability, content) and server actions
src/app/api/         availability (GET), bookings (POST)
src/components/      navigation, footer, hero, sections, treatments, booking,
                     gallery, animations, admin, ui
src/data/            treatment content, navigation, image registry
src/hooks/           use-lenis (smooth scroll provider), use-booking (wizard state)
src/lib/             prisma, auth, booking-service, availability, rate-limit, email,
                     whatsapp, calendar (.ics), seo (JSON-LD), time (Bogotá), validations
src/types/           booking, treatment
```

## 11. SEO

Unique Spanish metadata, canonical URLs and Open Graph per page; `sitemap.xml` and
`robots.txt` (admin/API disallowed); JSON-LD for `BeautySalon` (verified data only:
name, address, phone, Instagram, services), `Service`, `FAQPage` and `BreadcrumbList`;
semantic headings; alt text on every image; branded 404.
