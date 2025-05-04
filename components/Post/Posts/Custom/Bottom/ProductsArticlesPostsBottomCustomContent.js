export default function ProductsArticlesPostsBottomCustomContent({
  col,
  isAdmin,
  mongoUser,
}) {
  if (col.name !== "products" || col.name !== "articles") return null;
  return <div></div>;
}
