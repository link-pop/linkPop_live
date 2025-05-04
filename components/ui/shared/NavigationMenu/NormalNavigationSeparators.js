export default function NormalNavigationSeparators({ type, label }) {
  if (type === "desktop") return null;
  const className = "aleft105 my-2 border-gray-200";

  return (
    <>
      {/* Show separator after Contact in mobile view */}
      {label === "Contact" && <hr className={className} />}

      {/* Show separators for categories in mobile view */}
      {label === "Viewed Articles" && <hr className={className} />}
      {label === "Liked Reviews" && <hr className={className} />}
      {label === "Article Reviews" && <hr className={className} />}
    </>
  );
}
