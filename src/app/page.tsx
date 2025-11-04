"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
      },
    }),
  );

  return (
    <div className="mx-2 my-2 flex flex-col items-center justify-center">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={createProject.isPending}
        onClick={() => createProject.mutate({ value: value })}
      >
        Click to awake agent
      </Button>
    </div>
  );
}
