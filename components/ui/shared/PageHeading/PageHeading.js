import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export default function PageHeading({
  title,
  actionLink,
  actionText,
  className = "",
}) {
  return (
    <div className={`por f jcsb aic g15 ${className}`}>
      <div className="tac mxa fz22 fw600 mb15">{title}</div>
      {actionLink && (
        <Link href={actionLink} className="poa r0 f aic g5 fz24 fw600 mb15">
          <SquareArrowOutUpRight /> {actionText}
        </Link>
      )}
    </div>
  );
}
