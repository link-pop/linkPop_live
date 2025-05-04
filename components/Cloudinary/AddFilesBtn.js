"use client";

export default function AddFilesBtn({ onClick, col }) {
  return (
    <div
      onClick={onClick}
      className="btn_brand"
    >
      + {col.name} images
    </div>
  );
}
