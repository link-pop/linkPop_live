export default function EmptyState({
  message,
  className = "h-full flex items-center justify-center text-muted-foreground",
}) {
  return (
    <div className={className}>
      <p>{message}</p>
    </div>
  );
}
