import PostDelete from "./PostDelete";
import PostUpdate from "./PostUpdate";

export default function PostAdminIcons({
  post,
  col,
  iconClassName,
  postsPaginationType,
  customUpdateIcon,
  customDeleteIcon,
  canModify = true,
}) {
  return (
    <>
      {col.settings?.noUpdateIcon ? null : (
        <PostUpdate
          {...{ post, col, iconClassName, customIcon: customUpdateIcon }}
        />
      )}
      {col.settings?.noDeleteIcon || !canModify ? null : (
        <PostDelete
          {...{
            post,
            col,
            iconClassName,
            postsPaginationType,
            customIcon: customDeleteIcon,
          }}
        />
      )}
    </>
  );
}
