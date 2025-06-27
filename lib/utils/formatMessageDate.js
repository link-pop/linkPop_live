import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";

// Date separator formats - moved directly here
const DATE_SEPARATOR_FORMATS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  THIS_WEEK: "MMM d", // e.g., "Mar 15"
  THIS_YEAR: "MMM d", // e.g., "Mar 15"
  OLDER: "MMM d, yyyy", // e.g., "Mar 15, 2023"
};

/**
 * Formats a date for message separators
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale to use for formatting (default: 'en')
 * @returns {string} - Formatted date string
 */
export function formatMessageDate(date, locale = "en") {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  // Check if date is today
  if (isToday(dateObj)) {
    return locale === "en" ? "Today" : DATE_SEPARATOR_FORMATS.TODAY;
  }

  // Check if date is yesterday
  if (isYesterday(dateObj)) {
    return locale === "en" ? "Yesterday" : DATE_SEPARATOR_FORMATS.YESTERDAY;
  }

  // Check if date is this year
  if (isThisYear(dateObj)) {
    return format(dateObj, DATE_SEPARATOR_FORMATS.THIS_YEAR);
  }

  // For older dates, include the year
  return format(dateObj, DATE_SEPARATOR_FORMATS.OLDER);
}

/**
 * Groups messages by date and returns an array with date separators
 * @param {Array} messages - Array of message objects
 * @param {string} locale - The locale to use for formatting
 * @returns {Array} - Array with messages and date separators
 */
export function groupMessagesByDate(messages, locale = "en") {
  if (!messages || messages.length === 0) {
    return [];
  }

  const grouped = [];
  let lastDateString = null;

  messages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt);
    const currentDateString = formatMessageDate(messageDate, locale);

    // Add date separator if this is a new date
    if (currentDateString !== lastDateString) {
      grouped.push({
        type: "dateSeparator",
        id: `date-${messageDate.toDateString()}`,
        dateString: currentDateString,
        date: messageDate,
      });
      lastDateString = currentDateString;
    }

    // Add the message
    grouped.push({
      type: "message",
      ...message,
    });
  });

  return grouped;
}

/**
 * Checks if two dates are on the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;

  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  return d1.toDateString() === d2.toDateString();
}
