"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Renders the home UI with an input and a button that starts a background job.
 *
 * The input is controlled by local state; the button triggers a TRPC mutation with the input value,
 * disables while the mutation is pending, and shows a success toast when the job is added.
 *
 * @returns A JSX element containing a centered input and action button that invokes the background job.
 */
export default function Home() {
  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const data = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success("Background job added");
      },
    }),
  );
  return (
    <div className="mx-2 my-2 flex flex-col items-center justify-center">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={data.isPending}
        onClick={() => data.mutate({ value: value })}
      >
        Click to awake agent
      </Button>
    </div>
  );
}