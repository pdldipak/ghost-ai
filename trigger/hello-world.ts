import { task } from "@trigger.dev/sdk";

export const helloWorld = task({
  id: "hello-world",
  run: async (payload: { message: string }, { ctx }) => {
    console.log(payload.message, "attempt", ctx.attempt.number);

    return {
      ok: true,
      message: payload.message,
    };
  },
});
