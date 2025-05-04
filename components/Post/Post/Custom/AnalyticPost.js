import Link from "next/link";
import Post from "../Post";
import { getBrowserType } from "@/lib/utils/getBrowserInfo";
import { getSystemType } from "@/lib/utils/getSystemInfo";
import AnalyticPostFields from "./AnalyticPostFields";
import AnalyticPostSimilarity from "./AnalyticPostSimilarity";
import CreatedAtCustom from "../CreatedAtCustom";
import AnalyticPostSearchParams from "./AnalyticPostSearchParams";

export default function AnalyticPost(props) {
  const { post, isAdmin } = props;
  const { path, referrer, visitorId, createdBy } = post;

  // ! CREATED_BY
  const countryCode = createdBy?.countryCode;
  const platformType = createdBy?.platformType;
  const browserType = getBrowserType(createdBy?.userAgent);
  const systemType = getSystemType(createdBy?.userAgent);
  const emailProvider = createdBy?.email?.split("@")[1] || "";
  const language = createdBy?.language || "";
  const screenResolution = createdBy?.screenResolution || "";
  const deviceMemory = createdBy?.deviceMemory || "";

  // ! POST
  const postCountryCode = post?.countryCode;
  const postPlatformType = post?.platformType;
  const postBrowserType = getBrowserType(post?.userAgent);
  const postSystemType = getSystemType(post?.userAgent);
  const postEmailProvider = post?.email?.split("@")[1] || "";
  const postLanguage = post?.language || "";
  const postScreenResolution = post?.screenResolution || "";
  const postDeviceMemory = post?.deviceMemory || "";

  return (
    <Post
      {...{
        post,
        ...props,
        showAutoGenMongoFields: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        showCreatedBy: true,
        className: "maw760 wf",
      }}
      top4={
        <>
          <>
            <div className="if g5">
              <span className="gray">visited:</span>{" "}
              <Link
                className="db brand hover:underline"
                href={path}
                target="_blank"
              >
                {path === "/" ? "home" : path}
              </Link>{" "}
            </div>
            <div className="ml7 if g5">
              <span className="gray">from:</span>{" "}
              <Link
                className="db brand hover:underline"
                href={referrer}
                target="_blank"
              >
                {referrer === "/" ? "home" : referrer}
              </Link>
            </div>

            <CreatedAtCustom createdAt={post.createdAt} />

            {createdBy && (
              <>
                {/* // ! Created By Fields */}
                <div className="f fwn g5 my4">
                  <AnalyticPostFields
                    {...{
                      countryCode,
                      platformType,
                      browserType,
                      systemType,
                      emailProvider,
                      screenResolution,
                      deviceMemory,
                      language,
                      title: "Reg. Data",
                    }}
                  />

                  {/* // ! Post Fields */}
                  <AnalyticPostFields
                    {...{
                      countryCode: postCountryCode,
                      platformType: postPlatformType,
                      browserType: postBrowserType,
                      systemType: postSystemType,
                      emailProvider: postEmailProvider,
                      screenResolution: postScreenResolution,
                      deviceMemory: postDeviceMemory,
                      language: postLanguage,
                      title: "Cur. Data",
                    }}
                  />

                  {/* // ! Similarity */}
                  <AnalyticPostSimilarity
                    {...{
                      countryCode,
                      postCountryCode,
                      platformType,
                      postPlatformType,
                      browserType,
                      postBrowserType,
                      systemType,
                      postSystemType,
                      emailProvider,
                      postEmailProvider,
                      language,
                      postLanguage,
                      screenResolution,
                      postScreenResolution,
                      deviceMemory,
                      postDeviceMemory,
                    }}
                  />
                </div>
              </>
            )}

            {isAdmin && <div className="gray">visitorId:{visitorId}</div>}
            {isAdmin && <AnalyticPostSearchParams {...{ post }} />}
          </>
        </>
      }
    />
  );
}
