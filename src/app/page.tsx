"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
export default function Home() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.hello.queryOptions({ text: "Hello World" }));
  return (
    <div className="text-2xl flex items-center justify-center">
      {JSON.stringify(data, null, 2)}
    </div>
  );
}
