import AnimatedNavItem from "@/components/ui/shared/AnimatedNavItem/AnimatedNavItem";
import Link from "next/link";

export default function LinkGroup({
  title,
  links,
  className = "mxa asfs fc aic maw300 wf",
  linkClassName = "",
}) {
  return (
    <div className={className}>
      <div className="black mb10 fz18 fw600 wf tac">{title}</div>
      {links.map((link, index) => (
        <AnimatedNavItem className="h28" key={index}>
          <Link
            className={`${linkClassName} px15 -mx16 h28 pt5`}
            href={link.href}
          >
            {link.text}
          </Link>
        </AnimatedNavItem>
      ))}
    </div>
  );
}
