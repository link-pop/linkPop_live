import { useEffect } from "react";

export default function useNormalizeChatroomFullPostAllMsg() {
  useEffect(() => {
    document.body.classList.remove("pb75");
    document.querySelector(".ChatroomFullPostAllMsg")?.classList.add("pt60");
    return () => {
      document.body.classList.add("pb75");
      document
        .querySelector(".ChatroomFullPostAllMsg")
        ?.classList.remove("pt60");
    };
  }, []);

  return null;
}
