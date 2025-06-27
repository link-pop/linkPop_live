import MassMessagesStatisticsClient from "@/components/Chatrooms/MassMessagesStatisticsClient";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

// * Mass messages statistics page - shows all sent mass messages with stats
export default async function MassMessagesStatisticsPage() {
  const { mongoUser, isAdmin } = await getMongoUser();
  if (!mongoUser) redirect(LOGIN_ROUTE);

  // Convert MongoDB objects to plain objects to avoid serialization issues
  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  return (
    <div className="flex h-full w-full">
      <MassMessagesStatisticsClient
        mongoUser={plainMongoUser}
        isAdmin={isAdmin}
      />
    </div>
  );
}
