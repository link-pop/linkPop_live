import { deleteOne } from "./crud";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export async function deleteUserList(listId) {
  try {
    const { mongoUser } = await getMongoUser();

    if (!mongoUser) {
      return { error: "User not authenticated" };
    }

    if (!listId) {
      return { error: "List ID is required" };
    }

    // Delete the user list (only if owned by current user)
    const result = await deleteOne({
      col: "userlists",
      data: {
        _id: listId,
        createdBy: mongoUser._id,
        isSystemList: false, // Prevent deletion of system lists
      },
    });

    if (!result) {
      return { error: "Failed to delete user list or list not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting user list:", error);
    return { error: "Failed to delete user list" };
  }
}
