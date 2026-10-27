import { Fragment } from "react";

type GuideHighlightProps = {
  text: string;
  tokens: string[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function GuideHighlight({ text, tokens }: GuideHighlightProps) {
  if (!tokens.length) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded-sm bg-[var(--marigold)]/30 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
