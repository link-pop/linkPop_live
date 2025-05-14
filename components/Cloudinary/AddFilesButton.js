"use client";

import { useRef } from "react";
import AddFilesBtn from "./AddFilesBtn";
import AddFilesIcon from "./AddFilesIcon";

export default function AddFilesButton({
  addFilesIconClassName = "",
  addFilesButtonType = "icon",
  files,
  filesSet,
  isRequiredFiles,
  multiple = true,
  col,
}) {
  // * only stores files to state, not uploading
  const inputFileRef = useRef(null);

  const handleFileChange = (e) => {
    filesSet([...files, ...Array.from(e.target.files)]);
  };

  const handleClick = () => {
    // Reset the input value to allow selecting the same file again
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
    inputFileRef.current.click();
  };

  return (
    <div>
      {/* // ! this must be NOT button, cause button triggers form submit */}
      {addFilesButtonType === "button" && (
        <AddFilesBtn onClick={handleClick} col={col} />
      )}
      {addFilesButtonType === "icon" && (
        <AddFilesIcon onClick={handleClick} className={addFilesIconClassName} />
      )}

      <input
        ref={inputFileRef}
        className="sr-only cx"
        tabIndex={-1}
        type="file"
        multiple={multiple}
        onChange={handleFileChange}
      />
      {/* hidden required input to show native required error */}
      <input
        className="sr-only cx"
        tabIndex={-1}
        required={isRequiredFiles && files.length === 0}
      />
    </div>
  );
}
