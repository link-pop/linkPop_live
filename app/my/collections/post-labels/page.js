export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import {
  LOGIN_ROUTE,
  COLLECTIONS_POST_LABELS_HUB,
} from "@/lib/utils/constants";

export default async function PostLabelsPage() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  // Redirect to the default hub
  redirect(COLLECTIONS_POST_LABELS_HUB);
}
