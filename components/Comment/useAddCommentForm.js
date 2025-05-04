import { useEffect, useRef, useState } from "react";

export default function useAddCommentForm() {
  const [commentTextState, setCommentTextState] = useState("");
  const addCommentFormTextareaRef = useRef(null);

  useEffect(() => {
    if (commentTextState.includes(`@`)) {
      addCommentFormTextareaRef.current.focus();
    }
  }, [commentTextState]);

  return { commentTextState, setCommentTextState, addCommentFormTextareaRef };
}
