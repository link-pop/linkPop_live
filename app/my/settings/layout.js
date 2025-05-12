import SettingsNav from "@/app/my/settings/SettingsNav";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

// ! this must be Server Component
export default async function Layout({ children }) {
  const { mongoUser } = await getMongoUser();
  return (
    <div className={`wf`}>
      <div className={`mxa maw1000 f fww wf`}>
        <SettingsNav {...{ mongoUser, showUsername: true }} />
        <div
          className={`fc wf max-[600px]:wf min-[601px]:maw600 min-[601px]:flex-1`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
