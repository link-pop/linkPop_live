"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function DirectlinksTypeSwitch({ mongoUser }) {
  // Define directlink types for the switch
  const directlinkTypes = [
    {
      value: "all",
      label: "all",
      query: {
        createdBy: mongoUser?._id,
      },
    },
    {
      value: "active",
      label: "active",
      query: {
        createdBy: mongoUser?._id,
        active: true,
      },
    },
    {
      value: "inactive",
      label: "inactive",
      query: {
        createdBy: mongoUser?._id,
        active: false,
      },
    },
  ];

  // Custom query function for directlinks
  const directlinksQueryFn = async () => {
    if (!mongoUser?._id) {
      return directlinkTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      const typeCounts = await Promise.all(
        directlinkTypes.map((type) =>
          getAll({
            col: "directlinks",
            data: type.query,
          })
        )
      );

      return directlinkTypes.reduce((acc, type, index) => {
        acc[type.value] = typeCounts[index]?.length || 0;
        return acc;
      }, {});
    } catch (error) {
      console.error("❌ Error fetching directlinks:", error);
      return directlinkTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      className="wfc mxa"
      mongoUser={mongoUser}
      types={directlinkTypes}
      collection="directlinks"
      queryKey={["directlinks", "userStats"]}
      queryFn={directlinksQueryFn}
      paramName="type"
      defaultType="all"
    />
  );
}
