"use client";

import { getMassMessagesStatisticsCounts } from "@/lib/actions/getMassMessagesStatisticsCounts";
import FetchedTypeSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/FetchedTypeSwitch";
import useWindowWidth from "@/hooks/useWindowWidth";

// * Mass messages type switch component for filtering sent vs scheduled messages
export default function MassMessagesTypeSwitch({ mongoUser }) {
  const { windowWidth } = useWindowWidth();

  // Define message types for the switch
  const messageTypes = [
    {
      value: "all",
      label: "all",
      query: {},
    },
    {
      value: "sent",
      label: "sent",
      query: {
        messageType: "sent",
      },
    },
    {
      value: "scheduled",
      label: "scheduled",
      query: {
        messageType: "scheduled",
      },
    },
    {
      value: "hasFiles",
      label: "hasFiles",
      query: {
        messageType: "hasFiles",
      },
    },
    {
      value: "hasPrice",
      label: "hasPrice",
      query: {
        messageType: "hasPrice",
      },
    },
    {
      value: "hasPurchases",
      label: "hasPurchases",
      query: {
        messageType: "hasPurchases",
      },
    },
  ];

  // Custom query function for message counts
  const messageCountsQueryFn = async () => {
    if (!mongoUser?._id) {
      return messageTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      const counts = await getMassMessagesStatisticsCounts();

      return {
        all: counts.all || 0,
        sent: counts.sent || 0,
        scheduled: counts.scheduled || 0,
        hasFiles: counts.hasFiles || 0,
        hasPrice: counts.hasPrice || 0,
        hasPurchases: counts.hasPurchases || 0,
      };
    } catch (error) {
      console.error("❌ Error fetching message counts:", error);
      return messageTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      className="!maw1000 wf mx10"
      horizontalScrollstyle={windowWidth >= 1000 ? { minWidth: "1000px" } : {}}
      mongoUser={mongoUser}
      types={messageTypes}
      collection="chatmessages"
      queryKey={["massMessages", "messageStats"]}
      queryFn={messageCountsQueryFn}
      paramName="messageType"
      defaultType="all"
    />
  );
}
