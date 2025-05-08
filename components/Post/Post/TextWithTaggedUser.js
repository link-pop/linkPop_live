import Link from "next/link";

export default function TextWithTaggedUser({ post }) {
  return (
    <div className={`pr70 text-foreground`}>
      {post.text.includes("@")
        ? post.text.split(/^([^,]+)/).map((part, index) =>
            part.startsWith("@") ? (
              <Link
                className={`brand`}
                key={index}
                // go to user eg: /olivia
                href={`/${part
                  .slice(1)
                  .match(/^([^,]+)/)[1]
                  .trim()}`}
              >
                {part}
              </Link>
            ) : (
              part
            )
          )
        : post.text}
    </div>
  );
}
