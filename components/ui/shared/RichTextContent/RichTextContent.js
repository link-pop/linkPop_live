"use client";

export default function RichTextContent({ content, children, className = "" }) {
  if (!content && !children) return null;

  return (
    <div
      className={`prose dark:prose-invert max-w-none break-words ${className}`}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: content || children,
        }}
      />
    </div>
  );
}
