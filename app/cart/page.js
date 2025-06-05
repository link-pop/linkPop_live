import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import CartPageClient from "@/components/Cart/CartPageClient";

export default async function CartPage() {
  const { mongoUser } = await getMongoUser();

  return <CartPageClient mongoUser={mongoUser} />;
}
