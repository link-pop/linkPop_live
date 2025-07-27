export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { LOGIN_ROUTE } from "@/lib/utils/constants";
import PostLabelsContent from "../components/PostLabelsContent";

export default async function PostLabelListPage({ params }) {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  const { listid } = params;

  return <PostLabelsContent mongoUser={mongoUser} postLabelListId={listid} />;
}
