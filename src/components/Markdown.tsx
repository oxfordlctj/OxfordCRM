import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:text-ink-900 prose-h2:mt-5 prose-h2:mb-2 prose-h2:text-base prose-h3:text-sm prose-p:my-2 prose-li:my-0.5 prose-strong:text-ink-900 prose-table:text-xs prose-th:bg-ink-50 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
