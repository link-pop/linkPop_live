import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

export default async function AdminLayout({ children }) {
  // Get the current user and check if they are an admin
  const { mongoUser, isAdmin } = await getMongoUser();

  // If user is not logged in, redirect to login
  if (!mongoUser) {
    redirect(LOGIN_ROUTE);
  }

  // If user is not an admin, redirect to home
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-accent">
      <div className="container mx-auto">{children}</div>
    </div>
  );
}
