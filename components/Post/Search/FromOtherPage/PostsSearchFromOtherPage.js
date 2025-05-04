import AddCollectionAdminButton from "./AddCollectionAdminButton";
import PostsSearchButton from "./PostsSearchButton";

// ! don't refactor
// makes posts search from pages that are not postsPage (/products): eg from MAIN page
// also makes search from postsPage (/products)
export default function PostsSearchFromOtherPage({ col }) {
  return (
    <div className="PostsSearchBtn fcc g10 mt15 cp">
      <AddCollectionAdminButton {...{ col }} />
      <PostsSearchButton {...{ col }} />
    </div>
  );
}
