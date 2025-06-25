"use client";

import { Calendar } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

const MessagesScheduledIcon = () => {
  const router = useRouter();
  return (
    <Calendar
      className="w24 h24 cp hs"
      onClick={() => router.push("/my/queue?contentType=messages")}
    />
  );
};

export default MessagesScheduledIcon;
