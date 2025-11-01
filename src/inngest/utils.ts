import Sandbox from "@e2b/code-interpreter";

/**
 * Connects to and returns a sandbox instance identified by the given sandboxId.
 *
 * @param sandboxId - Identifier of the sandbox to connect to.
 * @returns The connected sandbox instance.
 */
export async function getSandBox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}