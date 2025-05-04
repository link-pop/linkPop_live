// don't use/render these url search params in:
// PostsFoundNum
// SearchParamsReset
// SearchParamsTags
// * removed "userId" from arr to allow user to search by their/all posts (user can change searchParams to achieve this)
export const skipUrlSearchParams = (col) => {
  const baseParams = ["page", "active"]; // block these fields (for ALl cols)
  return ["orders"].includes(col.name) ? baseParams : [...baseParams, "userId"]; // block these fields (for COLS IN ARR)
};
