import { useEffect, useState } from "react";
import Image from "next/image";

export const MessageLoading = (props: {}) => {
  return (
    <div className="flex flex-col group px-4 pb-4">
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/vibe.svg"
          alt="Vibe"
          height={18}
          width={18}
          className="shrink-0"
        />
        <span className="text-sm font-medium">Vibe</span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <ShimmerMessage />
      </div>
    </div>
  );
};

const ShimmerMessage = () => {
  const messages = [
    "Thinking...",
    "Loading...",
    "Generating...",
    "Analyzing your request...",
    "Building your website...",
    "Crafting components...",
    "Optimizing layout...",
    "Adding final touches...",
    "Almost ready...",
  ];

  const [currentMessageIndex, setcurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setcurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [messages.length]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-muted-foreground animate-pulse">
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
};
