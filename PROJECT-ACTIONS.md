# Project Actions

Setup history for **ghost-ai**.

| Date | Action |
|------|--------|
| 2026-06-16 | Scaffolded with `create-next-app` (TypeScript, Tailwind, App Router, ESLint) |
| 2026-06-17 | Stripped boilerplate: minimal `page.tsx`, Tailwind-only `globals.css`, removed `public/*.svg` (kept `app/favicon.ico`) |
| 2026-06-17 | Added Docker (`Dockerfile`, `docker-compose.yml`) and GitHub Actions CI/CD (lint, build, push image to GHCR on `main`) |
| 2026-06-17 | Fixed Docker build: keep `public/` in git (`.gitkeep`) so image COPY step succeeds |
