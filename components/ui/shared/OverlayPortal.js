import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const OverlayPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    document.body.appendChild(elRef.current);
    setMounted(true);
    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return mounted ? createPortal(children, elRef.current) : null;
};

export default OverlayPortal;
