Read and analyze the `current-issue.md` file thoroughly.

Your objectives are to:
- Understand the reported issue.
- Identify the root cause(s).
- Review the existing implementation.
- Determine the affected files, components, services, and dependencies.
- Evaluate potential side effects and impact.

## Important

**Do NOT modify any code, generate patches, or suggest implementation changes yet.**

After your analysis, provide the following:

### Analysis Summary
- Problem summary
- Suspected root cause(s)
- Affected files/components/services
- Proposed solution approach
- Risks, edge cases, and alternative solutions

---

# Approval Required

Do **not** proceed with implementation until I explicitly approve.

Please stop after the analysis and wait for my response.

Approval Status:

- [ ] **Approved** — Proceed with the proposed solution.
- [ ] **Not Approved** — Wait for further instructions or feedback.

I will reply with one of the following:
- `Approved`
- `Green light`
- `Proceed`
- Additional feedback or requested changes

**Do not make any code changes until you receive explicit approval.**

## Current Issue
[## Error Type]
CI/CD on build error 

## Error Message
[16s
Run npm run build

> ghost-assistant@0.1.0 build
> prisma generate && next build

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma.

✔ Generated Prisma Client (7.8.0) to ./app/generated/prisma in 42ms

⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 8.4s
  Running TypeScript ...
  Finished TypeScript in 4.7s ...
  Collecting page data using 1 worker ...
Error: DATABASE_URL is not set
    at <unknown> (.next/server/chunks/_1a99o88._.js:47:33347)
    at <unknown> (.next/server/chunks/_1a99o88._.js:47:33783)

> Build error occurred
Error: Failed to collect page data for /api/projects/[projectId]
    at ignore-listed frames {
  type: 'Error'
}
Error: Process completed with exit code 1.
]


### Check When Done 
 `npm run build` passes