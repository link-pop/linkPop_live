import AddFilesButton from "./AddFilesButton";
import AddFilesPreview from "./AddFilesPreview";

export default function AddFiles({
  files,
  filesSet,
  isRequiredFiles,
  col,
  usePreview = true,
  addFilesIconClassName,
}) {
  return (
    <>
      {usePreview && <AddFilesPreview {...{ files, filesSet }} />}
      <AddFilesButton
        {...{ files, filesSet, isRequiredFiles, col, addFilesIconClassName }}
      />
    </>
  );
}
