export default function FixedHeightContainer({
  children,
  height = "440px",
  className = "w-full bg-background rounded-lg shadow-sm p-3",
}) {
  return (
    <div className={className} style={{ height }}>
      {children}
    </div>
  );
}
