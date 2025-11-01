import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "4s");

    const summarizer = createAgent({
      name: "summarizer",
      system:
        "You are an expert summarizer. Your job is to summarizer the input in 2 words",
      model: openai({
        model: "gpt-5",
      }),
    });

    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.value} `,
    );
    console.log(output);

    return { message: output };
  },
);
