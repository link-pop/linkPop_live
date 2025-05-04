/**
 * Handles emoji insertion into textarea
 * @param {string} emoji - The emoji to insert
 * @param {object} textareaRef - Reference to the textarea element
 * @param {function} setText - State setter function for the text
 */
export default function handleEmojiClick(emoji, textareaRef, setText) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  setText((prev) => prev.slice(0, start) + emoji + prev.slice(end));

  // Move cursor after the inserted emoji
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    textarea.focus();
  }, 0);
}
