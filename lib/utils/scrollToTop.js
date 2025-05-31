/**
 * Scrolls the page to the top with smooth behavior
 * @param {Object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior ('smooth' or 'auto')
 * @param {number} options.top - Top position to scroll to (default: 0)
 */
export const scrollToTop = (options = {}) => {
  const { behavior = "smooth", top = 0 } = options;

  if (typeof window !== "undefined") {
    window.scrollTo({
      top,
      behavior,
    });
  }
};

/**
 * Scrolls to top immediately without animation
 */
export const scrollToTopInstant = () => {
  scrollToTop({ behavior: "auto" });
};

/**
 * Scrolls to top with smooth animation (default)
 */
export const scrollToTopSmooth = () => {
  scrollToTop({ behavior: "smooth" });
};
