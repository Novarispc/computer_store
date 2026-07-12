# Deploying Esquire Tech to Vercel

This app was built on SQLite + local file uploads. Neither works on Vercel's
read-only, ephemeral serverless filesystem, so the production setup uses:

- **Neon Postgres** for the database
- **Vercel Blob** for image uploads

The code already supports both. These are the one-time setup steps. Do them
**in this order** — the first deploy prerenders a few pages (`/`, `/categories`,
`/brands`) that read the database at build time, so the database must exist and
be seeded *before* you deploy.

---

## 1. Create the database (Neon)

1. Sign up at <https://neon.tech> and create a project (any region near Kerala,
   e.g. `ap-south-1`, is fine).
2. From **Connection Details**, copy two connection strings:
   - the **pooled** one (host contains `-pooler`) → this is `DATABASE_URL`
   - the **direct** one (no `-pooler`) → this is `DIRECT_URL`

## 2. Seed the database from your machine

With the two URLs, push the schema and load the 245 products:

```bash
# in the project root, with .env containing the two Neon URLs
npm install
npm run db:push      # creates the tables in Neon
npm run db:seed      # loads categories, brands, products, themes, homepage
```

Verify in Neon's SQL editor or `npm run db:studio` that you have 21 categories,
79 brands and ~245 products.

## 3. Create a Blob store (for image uploads)

1. In the Vercel dashboard → **Storage** → **Create** → **Blob**.
2. Connect it to the project you're about to create (or after step 4). Vercel
   injects `BLOB_READ_WRITE_TOKEN` into the project automatically.

## 4. Create the Vercel project & set env vars

1. Push this repo to GitHub/GitLab and **Import** it in Vercel (it auto-detects
   Next.js — no build settings to change).
2. Under **Settings → Environment Variables**, add (Production + Preview):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Neon **pooled** string |
   | `DIRECT_URL` | Neon **direct** string |
   | `ADMIN_PASSWORD` | a strong password (change from the dev default) |
   | `ADMIN_SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `BLOB_READ_WRITE_TOKEN` | auto-added when the Blob store is connected — confirm it's present |

## 5. Deploy

Trigger a deploy (push to the main branch, or **Deploy** in the dashboard).
The build runs `prisma generate && next build`; because the env vars are set and
the database is seeded, the prerendered pages build cleanly.

## 6. Re-upload the branding (one time)

Image files are **not** committed to the repo, so the logo and mascot don't ship
in the deploy — and they now live in Blob + the database, not on disk. After the
first deploy:

1. Go to `https://<your-app>.vercel.app/admin/login` and sign in.
2. Open **Branding** and re-upload:
   - **Header logo** (`logo-full`) — the mascot + wordmark lockup
   - **Intro mascot** — the flying figure, transparent background
   - **Services banner** — the "We Fix Laptops" artwork (optional)

These upload to Blob and their URLs are saved in the database, so they persist
and appear across the storefront, footer and admin immediately.

---

## Local development after the migration

SQLite is gone — local dev also needs Postgres now. The simplest path is a Neon
**dev branch**: create one in the Neon dashboard, put its pooled/direct URLs in
`.env` (see `.env.example`), and run `npm run dev` as before. Uploads without a
`BLOB_READ_WRITE_TOKEN` fall back to writing under `public/` locally.

## What was changed for Vercel

- `prisma/schema.prisma` — provider `sqlite` → `postgresql`, added `directUrl`
  and the `rhel-openssl-3.0.x` binary target for Vercel's runtime.
- Text search (`contains`) and find-or-create (`equals`) now use
  `mode: "insensitive"` — Postgres is case-sensitive where SQLite wasn't.
- `src/lib/uploads.ts` — writes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is
  set, else to `public/` for local dev.
- `src/lib/brand-assets.ts` — brand logo/mascot URLs are read from a `Setting`
  row instead of scanning the filesystem (which doesn't persist on Vercel).
- Admin section is `force-dynamic` — it's auth-gated and never prerendered.
