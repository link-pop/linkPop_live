"use client";

import { getAll } from "@/lib/actions/crud";
import FetchedTypeSwitch from "./FetchedTypeSwitch";

export default function LandingpagesTypeSwitch({ mongoUser }) {
  // Define landing page types for the switch
  const landingpageTypes = [
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

  // Custom query function for landing pages
  const landingpagesQueryFn = async () => {
    if (!mongoUser?._id) {
      return landingpageTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }

    try {
      const typeCounts = await Promise.all(
        landingpageTypes.map((type) =>
          getAll({
            col: "landingpages",
            data: type.query,
          })
        )
      );

      return landingpageTypes.reduce((acc, type, index) => {
        acc[type.value] = typeCounts[index]?.length || 0;
        return acc;
      }, {});
    } catch (error) {
      console.error("❌ Error fetching landingpages:", error);
      return landingpageTypes.reduce((acc, type) => {
        acc[type.value] = 0;
        return acc;
      }, {});
    }
  };

  return (
    <FetchedTypeSwitch
      className="wfc mxa"
      mongoUser={mongoUser}
      types={landingpageTypes}
      collection="landingpages"
      queryKey={["landingpages", "userStats"]}
      queryFn={landingpagesQueryFn}
      paramName="type"
      defaultType="all"
    />
  );
}
