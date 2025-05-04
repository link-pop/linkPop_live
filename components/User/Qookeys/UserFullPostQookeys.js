import UserFullPostLikes from "@/components/User/Qookeys/UserFullPostLikes";
import FullPost from "../../Post/Post/Full/FullPost";
import UserFullPostViews from "@/components/User/Qookeys/UserFullPostViews";
import UserFullPostCart from "@/components/User/Qookeys/UserFullPostCart";
import UserFullPostReviews from "@/components/User/Qookeys/UserFullPostReviews";
import CreatedBy from "../../Post/Post/CreatedBy";
import LinkWithIcon from "@/components/ui/shared/LinkWithIcon/LinkWithIcon";
import { getBrowserType } from "@/lib/utils/getBrowserInfo";

// TODO !! ??? move to some Qookeys folder
export default function UserFullPostQookeys({ post, col, isAdmin, mongoUser }) {
  const renderUserInfo = () => {
    if (!post) return null;

    const sections = [
      {
        title: "Profile",
        data: {
          Name: post.fullName,
          Email: post.primaryEmailAddress,
          Phone: post.primaryPhoneNumber,
          Gender: post.gender,
          Birthday: post.birthday,
          "Last Sign In": new Date(post.lastSignInAt).toLocaleString(),
          "Email Verified": post.emailAddresses?.[0]?.verified ? "Yes" : "No",
          "Phone Verified": post.phoneNumbers?.[0]?.verified ? "Yes" : "No",
        },
      },
      {
        title: "Location",
        data: {
          Country: post.country,
          City: post.city,
          Region: post.region,
          "Postal Code": post.postal,
          // Timezone: post.timezone,
          // "Timezone Offset": `${post.timezoneOffset} minutes`,
          Currency: post.currency,
          Coordinates:
            post.latitude && post.longitude
              ? `${post.latitude}, ${post.longitude}`
              : null,
        },
      },
      {
        title: "System",
        data: {
          Platform: post.platform,
          PlatformType: post.platformType,
          // ??? not working Browser: getBrowserType(post?.userAgent),
          Language: post.language,
          "Screen Resolution": post.screenResolution,
          "Color Scheme": post.colorScheme,
        },
      },
      {
        title: "Device",
        data: {
          "Color Depth": post.colorDepth,
          "Device RAM": `${post.deviceMemory} GB`,
          "CPU Cores": post.hardwareConcurrency,
          "Touch Points": post.maxTouchPoints,
          Orientation: post.screenOrientation,
        },
      },
      {
        title: "Network",
        data: {
          IP: post.ip,
          "Connection Type": post.effectiveType,
          "Download Speed": post.downlink ? `${post.downlink} Mbps` : null,
          "Network Latency": post.rtt ? `${post.rtt}ms` : null,
          "Data Saver": post.saveData ? "Enabled" : "Disabled",
          // Online: post.onLine ? "Yes" : "No",
          Organization: post.org,
        },
      },
      {
        title: "Battery",
        data: {
          "Battery Level": post.batteryLevel
            ? `${Math.round(post.batteryLevel * 100)}%`
            : null,
          "Battery Charging": post.batteryCharging ? "Yes" : "No",
          "Time to Full":
            post.batteryChargingTime !== Infinity
              ? `${Math.round(post.batteryChargingTime / 60)} minutes`
              : null,
          "Time Remaining":
            post.batteryDischargingTime !== Infinity
              ? `${Math.round(post.batteryDischargingTime / 60)} minutes`
              : null,
        },
      },
      {
        title: "Account",
        data: {
          "Clerk ID": post.clerkId,
          "Mongo ID": post?._id,
          "Created At": new Date(post.createdAt).toLocaleString(),
        },
      },
    ];

    return (
      <div className="max-w-[1400px] mxa ">
        <div className="title mb10">User Profile</div>
        <div className="por f g10 p-4 bg-gray-50 rounded-lg">
          <div className="poa t3 r3 fz10 gray ">
            <div className="ttu tar">User Registration Data</div>
            {/* <div className="ttl">some browsers can provide false data</div> */}
          </div>
          <CreatedBy {...{ createdBy: post, className: "poa t15 l30" }} />
          {sections.map((section) => (
            <div key={section.title} className={`fc g10 p5`}>
              {/* // * this Profile has opacity-0 so CreatedBy can be on its place */}
              <h3
                className={`text-lg font-semibold text-gray-800 ${
                  section.title === "Profile" ? "opacity-0" : ""
                }`}
              >
                {section.title}
              </h3>
              <div className="fc g10">
                {Object.entries(section.data).map(([key, value]) => {
                  if (value === null || value === undefined || value === "")
                    return null;
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm text-gray-500">{key}</span>
                      <span
                        className="text-sm font-medium text-gray-900 maw200 oh wsn toe"
                        title={value}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const bottomSectionClassName = "if sm:miw400 sm:maw400 px15 border-r-[1px]";

  return (
    <FullPost
      {...{
        post,
        col,
        isAdmin,
        mongoUser,
        className: "wf mxa",
      }}
      showAutoGenMongoFields={false}
      skipCustom={true} // ! Set to true to prevent infinite recursion
      showFiles={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      showTags={true}
      className="!miwf mxa"
      top3={renderUserInfo()}
      top9={
        <>
          <div className="fcc fwn wfc g15 mxa my5">
            {/* // ! ANALYTICS_DISABLED 1/2 COOLKEYS */}
            {/* <LinkWithIcon
              text="History"
              href={`/analytics?userId=${post?._id}`}
            /> */}
            <LinkWithIcon text="Orders" href={`/orders?userId=${post?._id}`} />
          </div>
          <div className="UserFullPostInfo f jcc aifs">
            <UserFullPostViews
              {...{
                post,
                isAdmin,
                mongoUser,
                className: bottomSectionClassName,
              }}
            />
            <UserFullPostLikes
              {...{
                post,
                isAdmin,
                mongoUser,
                className: bottomSectionClassName,
              }}
            />
            <UserFullPostReviews
              {...{
                post,
                isAdmin,
                mongoUser,
                className: bottomSectionClassName,
              }}
            />
            <UserFullPostCart
              {...{
                post,
                isAdmin,
                mongoUser,
                className: bottomSectionClassName,
              }}
            />
          </div>
        </>
      }
    />
  );
}
