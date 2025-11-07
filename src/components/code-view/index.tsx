import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "./code-theme.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";

import { useEffect } from "react";

interface CodeViewProps {
  code: string;
  lang: string;
}

export const CodeView = ({ code, lang }: CodeViewProps) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-sm line-numbers">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
};
