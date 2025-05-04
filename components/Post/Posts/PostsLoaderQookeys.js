import { RotateCw } from "lucide-react";
import "./PostsLoaderQookeys.css";
import { useState, useEffect } from "react";

export default function PostsLoaderQookeys({
  isLoading,
  className = "",
  ...props
}) {
  const [showReload, setShowReload] = useState(false);
  if (!isLoading) return null;

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowReload(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="wf">
      <div
        className={`loader mxa my15 w150 h17 br10 ${className}`}
        {...props}
      ></div>
      {showReload && (
        <div
          className="abounce -mt10 brand fz13 wfc mxa fcc text-center cursor-pointer hover:underline"
          onClick={() => window.location.reload()}
        >
          <span>not loading? </span>
          <span className="pl5 f g5">
            <span className="pt2">try</span>{" "}
            <RotateCw className="animate-pulse" />
          </span>
        </div>
      )}
    </div>
  );
}
