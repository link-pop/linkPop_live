"use client";

import NSFWContentAlert from "@/components/ui/shared/NSFWContentAlert/NSFWContentAlert";

/**
 * Utility function to display NSFW content alert dialogs
 * @param {Object} error - The error object with NSFW detection scores
 * @param {Function} dialogSet - Function to set dialog state (from context)
 * @param {Function} setNsfwScores - State setter function for NSFW scores (optional)
 * @param {Function} setProcessingStatus - State setter function to update processing status (optional)
 */
export default function showNSFWContentAlert(
  error,
  dialogSet,
  setNsfwScores = null,
  setProcessingStatus = null
) {
  // Update NSFW scores state if function provided
  if (setNsfwScores) {
    setNsfwScores(error.scores);
  }

  // Show the alert dialog
  dialogSet({
    isOpen: true,
    contentClassName: "max-w-md p-0",
    hasCloseIcon: false,
    showBtns: false,
    comp: (
      <NSFWContentAlert
        scores={error.scores}
        image={error.imageBase64}
        onClose={() => {
          dialogSet({ isOpen: false });
          if (setNsfwScores) {
            setNsfwScores(null);
          }
        }}
      />
    ),
  });

  // Update processing status if function provided
  if (setProcessingStatus) {
    setProcessingStatus(false);
  }
}
