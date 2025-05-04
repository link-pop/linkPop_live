"use client";

import ProfileImages from "@/app/my/settings/profile/ProfileImages";
import { useContext } from "@/components/Context/Context";

// TODO !!!!!!! rename to LandingPageImagesUploader
export default function ProfileImagesUploader({
  profileImage,
  coverImage,
  setProfileImage,
  setCoverImage,
  mongoUser,
}) {
  const { toastSet } = useContext();

  // Create an adapted landing page object to simulate a visited user
  const adaptedLandingPage = {
    profileImage: profileImage,
    coverImage: coverImage,
    name: "New Landing Page",
    isOwner: true,
  };

  // Handle image changes from ProfileImages component
  const handleImageChange = (type, url) => {
    if (type === "profileImage") {
      setProfileImage(url);
    } else if (type === "coverImage") {
      setCoverImage(url);
    }
  };

  return (
    <div className="">
      <ProfileImages
        mongoUser={mongoUser}
        visitedMongoUser={adaptedLandingPage}
        isLandingPage={true}
        onImageChange={handleImageChange}
        directImageUpdate={true}
        externalToast={toastSet}
      />
    </div>
  );
}
