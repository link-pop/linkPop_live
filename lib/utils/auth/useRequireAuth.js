"use client";

import { LOGIN_ROUTE } from "@/lib/utils/constants";
import { useRouter } from "next/navigation";
import { useContext } from "@/components/Context/Context";

export function useRequireAuth() {
  const router = useRouter();
  const { mongoUser } = useContext();

  return () => {
    if (!mongoUser?._id) {
      router.push(LOGIN_ROUTE);
      return true;
    }
    return false;
  };
}
