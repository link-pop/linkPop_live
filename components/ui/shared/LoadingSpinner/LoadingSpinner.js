import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  isSubmitting = false,
  initialText = "Submit",
}) {
  return (
    <>
      {isSubmitting ? (
        <span className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
        </span>
      ) : (
        initialText
      )}
    </>
  );
}
