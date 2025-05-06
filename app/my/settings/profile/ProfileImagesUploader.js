"use client";

// ! code start ProfileImagesUploader
import ProfileImagesUploader from "@/components/ui/shared/ProfileImagesUploader/ProfileImagesUploader";

export default function UserProfileImagesUploader(props) {
  return (
    <ProfileImagesUploader
      {...props}
      isLandingPage={false}
      uploadFolder="users"
    />
  );
}
// ? code end ProfileImagesUploader
