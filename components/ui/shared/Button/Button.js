import Link from "next/link";

// * QOOKEYS button
export default function Button({
  children,
  className = "",
  variant = "default",
  href,
  hoverClassName,
  ...props
}) {
  const variants = {
    black: `bg_black text-white ${
      hoverClassName ? `hover:${hoverClassName}` : "hover:bg-gray-400"
    } hover:text-[#1A1F1F]`,
    default: `border-gray-400 ${
      hoverClassName ? `hover:${hoverClassName}` : "hover:bg-gray-400"
    } hover:text-[#1A1F1F]`,
    ghost: "bg-transparent border-none",
  };

  const sharedClasses = `fcc fz14 bw1 w309 h35 br10 tracking-widest transition-all duration-300 relative overflow-hidden group ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClasses} {...props}>
        <span className="relative z-10">{children}</span>
        {variant !== "ghost" && (
          <div
            className={`absolute inset-0 ${
              hoverClassName
                ? hoverClassName.replace("hover:", "")
                : "bg-gray-400"
            } transform translate-y-full transition-transform duration-300 group-hover:translate-y-0`}
          ></div>
        )}
      </Link>
    );
  }

  return (
    <button className={sharedClasses} {...props}>
      <span className="relative z-10">{children}</span>
      {variant !== "ghost" && (
        <div
          className={`absolute inset-0 ${
            hoverClassName
              ? hoverClassName.replace("hover:", "")
              : "bg-gray-400"
          } transform translate-y-full transition-transform duration-300 group-hover:translate-y-0`}
        ></div>
      )}
    </button>
  );
}
