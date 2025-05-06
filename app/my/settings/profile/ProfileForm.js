"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import Textarea from "@/components/ui/shared/Textarea/Textarea";
import { update } from "@/lib/actions/crud";
import { checkNameUniqueness } from "@/lib/actions/checkNameUniqueness";
import ProfileImagesUploader from "./ProfileImagesUploader";
import Button from "../../../../components/ui/shared/Button/Button2";
import { useContext } from "../../../../components/Context/Context";
import useProfileFormValidation from "./useProfileFormValidation";
import SettingsNav from "../SettingsNav";
import { SOCIAL_MEDIA_ROUTE } from "@/lib/utils/constants";
import useFormErrors from "@/hooks/useFormErrors";

export default function ProfileForm({ mongoUser }) {
  if (!mongoUser?._id) return null;

  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    username: `${mongoUser.name}`,
    displayName: mongoUser.name,
    bio: mongoUser.bio || "",
    location: mongoUser.location || mongoUser.country || "",
    website: mongoUser.website || "",
    amazonWishlist: mongoUser.amazonWishlist || "",
  });

  // Add state for images
  const [profileImage, setProfileImage] = useState(
    mongoUser.profileImage || ""
  );
  const [coverImage, setCoverImage] = useState(mongoUser.coverImage || "");
  const [originalProfileImage, setOriginalProfileImage] = useState(
    mongoUser.originalProfileImage || ""
  );
  const [originalCoverImage, setOriginalCoverImage] = useState(
    mongoUser.originalCoverImage || ""
  );

  const { toastSet } = useContext();
  const { validateURL, validateForm, formatUrl } = useProfileFormValidation();
  const {
    errors: formErrors,
    setMultipleErrors,
    createChangeHandler,
  } = useFormErrors();

  const handleChange = createChangeHandler((e) => {
    const { name, value } = e.target;

    // Special handling for URLs
    if (name === "website" || name === "amazonWishlist") {
      // Remove http:// or https:// if user types it
      const cleanValue = value.replace(/^https?:\/\//i, "");

      setProfile((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));

      // Validate URL as user types
      if (cleanValue && !validateURL(cleanValue)) {
        setMultipleErrors({
          ...formErrors,
          [name]: t("enterValidDomain"),
        });
      }
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all form errors
    setMultipleErrors({});

    // Validate form using the validation hook
    const { isValid, errors } = validateForm(profile);

    if (!isValid) {
      setMultipleErrors(errors);
      return;
    }

    // Remove @ from username
    const cleanUsername = profile.username.replace("@", "");

    // Check username uniqueness
    const nameCheck = await checkNameUniqueness(
      cleanUsername,
      "users",
      mongoUser._id
    );

    if (!nameCheck.isUnique) {
      setMultipleErrors({ ...formErrors, username: nameCheck.error });
      return;
    }

    // Update user in DB
    await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: {
        name: cleanUsername,
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        website: formatUrl(profile.website),
        amazonWishlist: formatUrl(profile.amazonWishlist),
        // Add image fields
        profileImage: profileImage,
        coverImage: coverImage,
        originalProfileImage: originalProfileImage,
        originalCoverImage: originalCoverImage,
      },
      revalidate: "/my/settings/profile",
    });

    toastSet({
      isOpen: true,
      title: t("profileUpdated"),
    });
  };

  return (
    <div className={`fc g30 p15 wf maw600`}>
      {/* Replace ProfileImages with ProfileImagesUploader */}
      <ProfileImagesUploader
        mongoUser={mongoUser}
        profileImage={profileImage}
        coverImage={coverImage}
        setProfileImage={setProfileImage}
        setCoverImage={setCoverImage}
        originalProfileImage={originalProfileImage}
        originalCoverImage={originalCoverImage}
        setOriginalProfileImage={setOriginalProfileImage}
        setOriginalCoverImage={setOriginalCoverImage}
      />

      {/* FORM */}
      <form onSubmit={handleSubmit} className={`fc g20 wf maw600`}>
        {/* USERNAME */}
        <div className={`fc g5`}>
          <Input
            required={true}
            name="username"
            prefix="@"
            value={profile.username}
            onChange={handleChange}
            className={`gray br5`}
            label={t("username")}
            minLength={3}
            error={formErrors.username}
            helperText={`${process.env.NEXT_PUBLIC_CLIENT_URL.replace(
              /http(s)?:\/\//,
              ""
            )}/${profile.username.replace("@", "")}`}
          />
        </div>

        {/* DISPLAY NAME */}
        <div className={`fc g5`}>
          <Input
            required={true}
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            maxLength={40}
            minLength={3}
            className={`gray br5`}
            label={t("displayName")}
            error={formErrors.displayName}
          />
        </div>

        {/* BIO */}
        <div className={`fc g5`}>
          <Textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            maxLength={1000}
            className={`gray br5 mih100 resize-none wf`}
            label={t("bio")}
            error={formErrors.bio}
          />
        </div>

        {/* LOCATION */}
        <div className={`fc g5`}>
          <Input
            name="location"
            value={profile.location}
            onChange={handleChange}
            maxLength={64}
            className={`gray br5`}
            label={t("location")}
            error={formErrors.location}
          />
        </div>

        {/* WEBSITE */}
        <div className={`fc g5`}>
          <Input
            type="text"
            name="website"
            value={profile.website}
            onChange={handleChange}
            maxLength={100}
            className={`gray br5`}
            placeholder="google.com"
            error={formErrors.website}
            label={t("websiteUrl")}
          />
        </div>

        {/* AMAZON WISHLIST */}
        <div className={`fc g5`}>
          <Input
            type="text"
            name="amazonWishlist"
            value={profile.amazonWishlist}
            onChange={handleChange}
            maxLength={100}
            className={`gray br5`}
            placeholder="amazon.com/wishlist/123"
            error={formErrors.amazonWishlist}
            label={t("amazonWishlist")}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <Button type="submit" className={`bg-[--color-brand] white br5 p10 cp`}>
          {t("saveChanges")}
        </Button>
      </form>

      {/* // * CUSTOM SETTINGS NAV */}
      <SettingsNav
        {...{
          forceShowNav: true,
          className: `!maw600 !wf`,
          mongoUser,
          customLinks: [
            {
              href: `${SOCIAL_MEDIA_ROUTE}`,
              label: "socialMedia",
            },
          ],
        }}
      />
    </div>
  );
}
