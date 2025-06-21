import StoreitemPost from "../../Custom/StoreitemPost";

export default function StoreitemFullPost({ post, col, isAdmin, mongoUser }) {
  return <StoreitemPost {...{ post, col, isAdmin, mongoUser }} />;
}
