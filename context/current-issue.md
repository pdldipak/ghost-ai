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
[5s
Run npm run lint
> ghost-assistant@0.1.0 lint
> eslint
/home/runner/work/ghost-ai/ghost-ai/hooks/use-share-dialog.ts
  95:10  error  Error: Calling setState synchronously within an effect can trigger cascading renders
Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.
Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).
/home/runner/work/ghost-ai/ghost-ai/hooks/use-share-dialog.ts:95:10
  93 |     }
  94 |
> 95 |     void loadCollaborators();
     |          ^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  96 |   }, [loadCollaborators, open, projectId]);
  97 |
  98 |   const openDialog = useCallback(() => {  react-hooks/set-state-in-effect
✖ 1 problem (1 error, 0 warnings)
Error: Process completed with exit code 1.

]


### Check When Done 
`npm run lint` and `npm run build` passes