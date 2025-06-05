import AddStoreItemForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddStoreItemForm";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";

export default async function AddStoreItemPage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) {
    redirect("/login");
  }

  const col = { name: "storeitems" };

  return (
    <div className="container mx-auto max-w-2xl p20">
      <AddStoreItemForm
        col={col}
        mongoUser={mongoUser}
        placeholder="Describe your store item..."
        submitBtnText="Add to Store"
      />
    </div>
  );
}
