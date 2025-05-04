import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export default function LinkWithIcon({ href, text, className = "" }) {
  return (
    <Link
      className={`fcc fwn g5 wf tac brand hover:underline ${className}`}
      href={href}
    >
      {text} <SquareArrowOutUpRight />
    </Link>
  );
}
