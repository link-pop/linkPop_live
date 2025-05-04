import React from "react";
import Link from "next/link";

// NOT FINISHED; SHOWN FOR ADMIN ONLY;
// PROBLEM: when searParams are changed, new page visit not happening => searParams are NOT RECORDED to analytics
export default function AnalyticPostSearchParams(props) {
  const { post } = props;
  const { postType, searchParams } = post || {};

  if (!searchParams || typeof searchParams !== "string") {
    return null;
  }

  return (
    <div className="if g5 mt2">
      <span className="gray">searchParams:</span>
      {new URLSearchParams(searchParams)
        .toString()
        .split("&")
        .map((param, index) => {
          const [key, value] = param.split("=").map(decodeURIComponent);

          if (postType) {
            return (
              <Link
                // * show Link if postType (eg: "products") is defined
                key={index}
                href={`/${postType}?${key}=${value}`}
                className="brand hover:underline"
              >
                {`${key}=${value}`}
              </Link>
            );
          }

          return (
            <span
              // *  show span if postType (eg: "products") is not defined
              key={index}
              className="brand"
            >
              {`${key}=${value}`}
            </span>
          );
        })}
    </div>
  );
}
