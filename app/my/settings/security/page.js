import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import ShowFansCount from "./ShowFansCount";
import ShowMediaCount from "./ShowMediaCount";
import EnableComments from "./EnableComments";
import ShowActivityStatus from "./ShowActivityStatus";

export default async function securitypage() {
  const { mongoUser } = await getMongoUser();

  return (
    <div className={`fc`}>
      <ShowFansCount {...{ mongoUser }} />
      <ShowMediaCount {...{ mongoUser }} />
      <EnableComments {...{ mongoUser }} />
      <ShowActivityStatus {...{ mongoUser }} />
    </div>
  );
}
