"use client";

import DirectlinkLandingpagePost from "./DirectlinkLandingpagePost";

export default function LandingpagePost(props) {
  return (
    <DirectlinkLandingpagePost
      {...props}
      customContent={<>{/* Add any landing page specific content here */}</>}
    />
  );
}
