export const dynamic = "force-dynamic";
import AddStoreItemWithSteps from "@/components/ui/shared/AddStoreItemWithSteps/AddStoreItemWithSteps";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";

export default async function AddStoreItemPage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) {
    redirect("/login");
  }

  const col = { name: "storeitems" };

  return <AddStoreItemWithSteps col={col} mongoUser={mongoUser} />;
}
