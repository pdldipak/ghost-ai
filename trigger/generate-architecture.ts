import { task } from "@trigger.dev/sdk";

interface GenerateArchitecturePayload {
  projectId: string;
  prompt: string;
}

export const generateArchitecture = task({
  id: "generate-architecture",
  run: async (payload: GenerateArchitecturePayload, { ctx }) => {
    console.log(
      "generate-architecture",
      payload.projectId,
      "attempt",
      ctx.attempt.number,
    );

    return {
      projectId: payload.projectId,
      prompt: payload.prompt,
    };
  },
});
