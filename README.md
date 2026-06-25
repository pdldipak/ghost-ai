# ghost AI

Minimal Next.js app.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

### Production

Builds the production image and runs the standalone Next.js server:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Development

Runs `next dev` with hot reload. Source code is mounted from your machine:

```bash
docker compose --profile dev up app-dev
```

Open [http://localhost:3000](http://localhost:3000). The first start runs `npm ci` inside the container; later starts are faster.

Stop either mode with `Ctrl+C`, or run `docker compose down` in another terminal.

## CI/CD

GitHub Actions runs lint + build on every push/PR. On `main`, it also builds and pushes a Docker image to GitHub Container Registry (`ghcr.io/pdldipak/ghost-ai`).
