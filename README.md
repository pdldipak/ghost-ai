# ghost AI

Minimal Next.js app.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

```bash
docker compose up --build
```

## CI/CD

GitHub Actions runs lint + build on every push/PR. On `main`, it also builds and pushes a Docker image to GitHub Container Registry (`ghcr.io/pdldipak/ghost-ai`).
