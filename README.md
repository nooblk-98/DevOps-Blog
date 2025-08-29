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

Docker

- Build and run with Compose (recommended):
  - `docker compose up --build -d`
  - App: http://localhost:8080
  - Environment overrides (optional):
    - `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - Data persistence:
    - SQLite file persisted in volume `db-data`
    - Uploads persisted in volume `uploads`

- Build/run manually with Docker:
  - `docker build -t devops-blog .`
  - `docker run -p 8080:8080 -e JWT_SECRET=change-me -v devops-blog-db:/app/db -v devops-blog-uploads:/app/public/uploads devops-blog`

CI/CD (GitHub Actions → Docker Hub)

- Workflow: `.github/workflows/docker.yml`
- On every push to `main`, builds a multi-arch image (linux/amd64, linux/arm64) and pushes to Docker Hub.
- Configure repository secrets:
  - `DOCKERHUB_USERNAME`: your Docker Hub username or org
  - `DOCKERHUB_TOKEN`: Docker Hub access token (with write perms)
- Image name defaults to: `<DOCKERHUB_USERNAME>/<repo>`
- Tags pushed:
  - `latest` on default branch
  - SHA tag on all pushes
  - Tag name on git tag pushes
