import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import AutoFollowBackMyFans from "./AutoFollowBackMyFans";

export default async function fanspage() {
  const { mongoUser } = await getMongoUser();

  return (
    <div className={`fc`}>
      <AutoFollowBackMyFans {...{ mongoUser }} />
    </div>
  );
}
