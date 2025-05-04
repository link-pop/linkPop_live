export function getLinkHref(item, mongoUser) {
  if (item.href === "/profile") {
    return mongoUser?.name ? `/users/${mongoUser.name}` : "/users/default";
  }
  return item.href;
}

export function isActiveLink(pathname, item, mongoUser) {
  const href = getLinkHref(item, mongoUser);
  
  // * For My profile, only highlight when viewing own profile
  if (item.href === "/profile" && pathname.includes("/users/")) {
    return pathname === `/users/${mongoUser?.name}`;
  }
  
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}
