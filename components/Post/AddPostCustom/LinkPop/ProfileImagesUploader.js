"use client";

import ProfileImagesUploader from "@/components/ui/shared/ProfileImagesUploader/ProfileImagesUploader";

export default function LinkPopProfileImagesUploader(props) {
  return (
    <ProfileImagesUploader
      {...props}
      isLandingPage={true}
      uploadFolder="landingpages"
    />
  );
}
