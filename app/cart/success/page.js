export const dynamic = "force-dynamic";
import { Suspense } from "react";
import CartSuccessClient from "@/components/Cart/CartSuccessClient";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export default async function CartSuccessPage() {
  const { mongoUser } = await getMongoUser();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartSuccessClient mongoUser={mongoUser} />
    </Suspense>
  );
}
