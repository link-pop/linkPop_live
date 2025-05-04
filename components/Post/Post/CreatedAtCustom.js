import React from "react";
import CreatedAt from "./CreatedAt";
import CreatedAtTimeAgo from "./CreatedAtTimeAgo";

export default function CreatedAtCustom({
  createdAt,
  className = "",
  createdAtClassName = "",
  createdAtTimeAgoClassName = "",
  showDash = true,
}) {
  return (
    <div className={`f g5 ${className}`}>
      <CreatedAt className={`m0 ${createdAtClassName}`} createdAt={createdAt} />
      {showDash && <span className="fz14 gray">-</span>}
      <CreatedAtTimeAgo
        className={createdAtTimeAgoClassName}
        createdAt={createdAt}
      />
    </div>
  );
}
