"use server";

export async function getBookmarkCollectionsCounts(
  systemLists,
  bookmarkLists,
  allBookmarks
) {
  try {
    const counts = {};

    // Count system lists
    Object.keys(systemLists).forEach((listId) => {
      switch (listId) {
        case "all-bookmarks":
          counts[listId] = allBookmarks.length;
          break;
        default:
          counts[listId] = 0;
      }
    });

    // Count custom lists
    bookmarkLists.forEach((list) => {
      counts[list.slug] = (list.bookmarkIds || []).length;
    });

    return counts;
  } catch (error) {
    console.error("❌ Error calculating bookmark collection counts:", error);
    return {};
  }
}
