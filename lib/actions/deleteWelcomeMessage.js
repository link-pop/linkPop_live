"use server";

import getMongoUser from "../utils/mongo/getMongoUser";
import { update } from "./crud";

export async function deleteWelcomeMessage() {
  const { mongoUser } = await getMongoUser();

  await update({
    col: "users",
    data: { _id: mongoUser._id },
    update: { welcomeMessage: null },
    revalidate: "/my/settings/messaging",
  });
}
