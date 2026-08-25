import { auth } from "@trigger.dev/sdk";

export async function createRunPublicToken(runId: string): Promise<string> {
  return auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
  });
}
