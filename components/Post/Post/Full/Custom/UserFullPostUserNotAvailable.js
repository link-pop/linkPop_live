"use client";

import NoPosts from "@/components/Post/Posts/NoPosts";

export default function UserFullPostUserNotAvailable({ visitedMongoUser }) {
  return (
    <div className={`fc mt15 p15 wf maw600 mxa tac`}>
      <span className={`fz24 fw500`}>
        @{visitedMongoUser?.name} is currently unavailable
      </span>
      <NoPosts col={{ name: "users" }} />
    </div>
  );
}
