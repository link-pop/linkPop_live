export default function CreatedAt({
  createdAt,
  className = "mla",
  style,
  showTime = true,
  showDate = true,
  dateType = "new", // new = X days ago; old = date
}) {
  const { locale: userLocale, timeZone: userTimeZone } =
    Intl.DateTimeFormat().resolvedOptions();

  // Convert ISO string to Date object if needed
  const dateObj =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  const getFormattedDate = (date) => {
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} days ago`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "yesterday";
    } else {
      return date.toLocaleDateString(userLocale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    }
  };

  const createdAtFormatted =
    dateType === "old"
      ? dateObj.toLocaleDateString(userLocale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : getFormattedDate(dateObj);

  return (
    <div
      suppressHydrationWarning
      className={`fz14 text-gray-300 ${className}`}
      style={style}
    >
      {createdAtFormatted}
    </div>
  );
}
