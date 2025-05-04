import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import ProfileForm from "@/app/my/settings/profile/ProfileForm";

export default async function profilePage() {
  const { mongoUser } = await getMongoUser();

  return <ProfileForm {...{ mongoUser }} />;
}
