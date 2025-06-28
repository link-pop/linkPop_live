export const dynamic = "force-dynamic";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import CartOrdersEarningsClient from "@/components/Cart/CartOrdersEarningsClient";

export default async function CartPage() {
  const { mongoUser } = await getMongoUser();

  return <CartOrdersEarningsClient mongoUser={mongoUser} />;
}
