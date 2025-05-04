import AddPostForm from "./AddPostForm";
import AddPostFormCustomContent from "./AddPostFormCustomContent/AddPostFormCustomContent";
import AddPostFormInputs from "./AddPostFormInput/AddPostFormInputs";
import checkAddPostFormHasFiles from "./checkAddPostFormHasFiles";

export default async function AddPostFormWithInputs({
  col,
  mongoUser,
  updatingPost,
  isDev,
}) {
  const { hasFiles, isRequiredFiles } = await checkAddPostFormHasFiles(col);

  return (
    <div className="bg_white">
      <AddPostForm
        {...{ col, mongoUser, updatingPost, hasFiles, isRequiredFiles, isDev }}
      >
        <AddPostFormCustomContent {...{ col, updatingPost }} />
        <AddPostFormInputs {...{ col, updatingPost }} />
      </AddPostForm>
    </div>
  );
}
