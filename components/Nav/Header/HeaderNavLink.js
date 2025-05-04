import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedNavItem from "@/components/ui/shared/AnimatedNavItem/AnimatedNavItem";

export default function HeaderNavLink(props) {
  const { className, href, children, onClick, ...restProps } = props;

  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);

      const scrollToElement = (element) => {
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      };

      if (pathname !== "/") {
        router.push("/");
        setTimeout(() => {
          const element = document.getElementById(targetId);
          scrollToElement(element);
        }, 2000);
      } else {
        const element = document.getElementById(targetId);
        scrollToElement(element);
      }
    }
    onClick?.(e);
  };

  const isActive = href.startsWith("#")
    ? pathname === "/" && pathname?.includes(href.substring(1))
    : pathname === href;

  return (
    <AnimatedNavItem className="wfc aleft105" isActive={isActive}>
      <Link
        {...restProps}
        href={href.startsWith("#") ? "/" + href : href}
        onClick={handleClick}
        className={`wsn px15 !-mx16 pb2 aleft105 ${
          isActive ? "brand" : ""
        } hover:brand ${className}`}
        variant="ghost"
        // prefetch={false}
      >
        {children}
      </Link>
    </AnimatedNavItem>
  );
}
