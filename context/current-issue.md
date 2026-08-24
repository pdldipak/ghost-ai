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
npm run trigger:dev

## Error Message
[------start----

npm run trigger:dev

> ghost-assistant@0.1.0 trigger:dev
> trigger dev


Trigger.dev (4.5.12)
------------------------------------------------------
│
●  Node 24 is available, upgrade your projects
│  We recommend upgrading to Node 24. It will become the default for new projects in 4-8 weeks.
│  https://trigger.dev/docs/config/config-file#runtime
Key: Version | Task | Run
------------------------------------------------------
○ Building local worker…
│
■  Error: No trigger files found
│
│         Dirs config:
│         ./trigger
│
│         Search patterns:
│         ./trigger/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}
│
│         Possible solutions:
│         1. Check if the directory paths in your config are correct
│         2. Verify that your files match the search patterns
│         3. Update the search patterns in your config
│
│         View the config docs https://trigger.dev/docs/config/config-file
│
│  � Get a fix for this error using AI https://cloud.trigger.dev/projects/proj_bzliuuxkcnmpifganxmx/ai-help?q=Build+failed%3A%0A+%0A%0AError%0A++++at+bundleWorker+%28file%3A%2F%2F%2Fhome%2Fdipak%2F
projects-wsl%2Fghost-ai%2Fnode_modules%2Ftrigger.dev%2Fdist%2Fesm%2Fbuild%2Fbundle.js%3A54%3A15%29%0A++++at+async+runBundle+%28file%3A%2F%2F%2Fhome%2Fdipak%2Fprojects-wsl%2Fghost-ai%2Fnode_modules%2
Ftrigger.dev%2Fdist%2Fesm%2Fdev%2FdevSession.js%3A116%3A34%29%0A++++at+async+startDevSession+%28file%3A%2F%2F%2Fhome%2Fdipak%2Fprojects-wsl%2Fghost-ai%2Fnode_modules%2Ftrigger.dev%2Fdist%2Fesm%2Fdev
%2FdevSession.js%3A141%3A26%29%0A++++at+async+startDev+%28file%3A%2F%2F%2Fhome%2Fdipak%2Fprojects-wsl%2Fghost-ai%2Fnode_modules%2Ftrigger.dev%2Fdist%2Fesm%2Fcommands%2Fdev.js%3A224%3A23%29%0A++++at+
async+devCommand+%28file%3A%2F%2F%2Fhome%2Fdipak%2Fprojects-wsl%2Fghost-ai%2Fnode_modules%2Ftrigger.dev%2Fdist%2Fesm%2Fcommands%2Fdev.js%3A137%3A29%29%0A++++at+async+file%3A%2F%2F%2Fhome%2Fdipak%2Fp
rojects-wsl%2Fghost-ai%2Fnode_modules%2Ftrigger.dev%2Fdist%2Fesm%2Fcommands%2Fdev.js%3A69%3A13%0A++++at+async+wrapCommandAction+%28file%3A%2F%2F%2Fhome%2Fdipak%2Fprojects-wsl%2Fghost-ai%2Fnode_modul
es%2Ftrigger.dev%2Fdist%2Fesm%2Fcli%2Fcommon.js%3A47%3A24%29
node:internal/process/promises:394
    triggerUncaughtException(err, true /* fromPromise */);
    ^

SkipLoggingError
    at bundleWorker (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/build/bundle.js:54:15)
    at async runBundle (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/dev/devSession.js:116:34)
    at async startDevSession (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/dev/devSession.js:141:26)
    at async startDev (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/commands/dev.js:224:23)
    at async devCommand (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/commands/dev.js:137:29)
    at async file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/commands/dev.js:69:13
    at async wrapCommandAction (file:///home/dipak/projects-wsl/ghost-ai/node_modules/trigger.dev/dist/esm/cli/common.js:47:24)

Node.js v24.16.0.


----End------]


### Check When Done 
`npm run ci`, `npm run lint` and `npm run build` passes