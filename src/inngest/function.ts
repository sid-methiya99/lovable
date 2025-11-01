import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandBox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-test-sid-1");
      return sandbox.sandboxId;
    });

    const summarizer = createAgent({
      name: "code-agent",
      system:
        "You are an expert next.js developer. You write readable,maintainable code. You write simple next.js and react snippets",
      model: openai({
        model: "gpt-4.1",
      }),
    });

    const { output } = await summarizer.run(
      `Give the following snippet: ${event.data.value} `,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandBoxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandboxUrl };
  },
);
