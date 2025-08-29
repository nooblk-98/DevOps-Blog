# DevOps Blog (SQLite backend)

This project has been migrated off Supabase to a local SQLite-backed API while keeping the React UI mostly unchanged.

Quick start

- Install deps: `pnpm install`
- Run API + web together: `pnpm dev:full`
  - App serves on `http://localhost:8080`
  - API runs on `http://localhost:5174` (proxied by Vite under `/api`)

Admin login

- Default credentials (seeded on first run):
  - Email: `admin@example.com`
  - Password: `admin123`
- To override, set env vars when starting the server:
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
  - Example: `ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=strong pnpm server`

Sample data

- On first launch, the database is seeded with:
  - 3 categories (DevOps, CI/CD, Kubernetes)
  - 3 tags (Docker, GitHub Actions, Helm)
  - 3 published sample posts with images and relations
  - Basic site settings (banner, site info, about, social)

Notes

- Images uploaded in the Admin are stored under `public/uploads` by the API. These are served locally via `/uploads/...`.
- If deploying to platforms without persistent filesystem (e.g., Vercel), replace storage with S3/Cloudinary or similar.
- The lightweight client in `src/lib/supabase.ts` emulates the subset of the Supabase API used by the UI.
