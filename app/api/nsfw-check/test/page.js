import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { redirect } from "next/navigation";
import NSFWCheckTestClient from "./NSFWCheckTestClient";

// Test page for NSFW content detection API with admin protection
export default async function NSFWCheckTest() {
  // Check if user is admin
  const { isAdmin } = await getMongoUser();

  // If not admin, redirect to home page
  if (!isAdmin) {
    redirect("/");
  }

  return <NSFWCheckTestClient />;
}
