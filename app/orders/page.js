export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import CartOrdersEarningsClient from "@/components/Cart/CartOrdersEarningsClient";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

export default async function OrdersPage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) {
    redirect(LOGIN_ROUTE);
  }

  return <CartOrdersEarningsClient mongoUser={mongoUser} />;
}
