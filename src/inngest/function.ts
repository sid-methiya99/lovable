import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createTool,
  type Message,
  openai,
  Tool,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandBox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/db";
import {
  FRAGMENT_TITLE_PROMPT,
  RESPONSE_PROMPT,
} from "@/lib/ADDITIONAL_PROMPT";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codingAgent = inngest.createFunction(
  { id: "run-agent" },
  { event: "test/run-agent" },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-test-sid-1");
      await sandbox.setTimeout(1_800_000);
      return sandbox.sandboxId;
    });

    const previousMessage = await step.run("get-previous-message", async () => {
      const formattedMessages: Message[] = [];
      console.log(event.data?.projectId);
      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data?.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSITANT" ? "assistant" : "user",
          content: message.content,
        });
      }

      return formattedMessages.reverse();
    });

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessage,
      },
    );

    const codeAgent = createAgent<AgentState>({
      name: "code_agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-5",
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to add commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandBox(sandBoxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`,
                );
                return `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "Create_or_update_file",
          description: "Create or update file in sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandBox(sandBoxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return "Error: " + error;
                }
              },
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFile",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandBox(sandBoxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return "Error: " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding_agent_network",
      agents: [codeAgent],
      maxIter: 5,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent({
      name: "fragment_title_generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o", // Make this google gemini
      }),
    });

    const responseGenerator = createAgent({
      name: "respone_generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary,
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary,
    );

    const parseAgentOutput = (value: Message[]) => {
      const output = value[0];
      if (output.type !== "text") {
        return "Here you go";
      }

      if (Array.isArray(output.content)) {
        return output.content.map((txt) => txt).join("");
      } else {
        return output.content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandBoxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: "ASSITANT",
            type: "ERROR",
          },
        });
      }
      await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: parseAgentOutput(responseOutput),
          role: "ASSITANT",
          type: "RESULT",
          fragment: {
            create: {
              sandBoxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOutput),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: parseAgentOutput(fragmentTitleOutput),
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
