"use server";

import { getAll } from "./crud";

export const getUserByName = async (name) => {
  const decodedName = decodeURIComponent(name).replace(/-/g, " ");

  const users = await getAll({
    col: { name: "users" },
    data: {
      name: { $regex: new RegExp("^" + decodedName + "$", "i") }, // case-insensitive exact match
    },
  });

  return users?.[0] || null;
};
