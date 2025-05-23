import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import SocialMediaLinks from "./SocialMediaLinks";

export default async function SocialMediaPage() {
  const { mongoUser } = await getMongoUser();

  return (
    <div className={`fc g20`}>
      <SocialMediaLinks {...{ mongoUser, className: "mt15" }} />
      <SocialMediaLinks {...{ mongoUser, className: "mt15", mode: "other" }} />
    </div>
  );
}
