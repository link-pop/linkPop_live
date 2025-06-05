import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import OrdersClient from "@/components/Orders/OrdersClient";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

export default async function OrdersPage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) {
    redirect(LOGIN_ROUTE);
  }

  return <OrdersClient mongoUser={mongoUser} />;
}
