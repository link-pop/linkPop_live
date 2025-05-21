"use client";

import { useState, useEffect } from "react";
import AddFiles from "@/components/Cloudinary/AddFiles";
import { update } from "@/lib/actions/crud";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { formatFileData } from "@/lib/utils/files/formatFileData";
import { useContext } from "../../../../components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import {
  BRAND_INVERT_CLASS,
  ICONBUTTON_CLASS,
  ONBOARDING_ROUTE,
} from "@/lib/utils/constants";
import { Trash2, Crop } from "lucide-react";

export default function ProfileImages({
  mongoUser,
  visitedMongoUser,
  isLandingPage = false,
  onImageChange = null,
  directImageUpdate = false,
  externalToast = null,
  previewMode = false,
  previewClasses = null,
  customBgColor = null,
  onReCrop = null,
  disableUpload = false,
}) {
  const { dialogSet, toastSet } = useContext();
  const [isUploading, setIsUploading] = useState(false);
  const [coverFiles, setCoverFiles] = useState([]);
  const [profileFiles, setProfileFiles] = useState([]);
  const [localProfileImage, setLocalProfileImage] = useState(
    visitedMongoUser?.profileImage || null
  );
  const [localCoverImage, setLocalCoverImage] = useState(
    visitedMongoUser?.coverImage || null
  );
  const { t } = useTranslation();
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setLocalProfileImage(visitedMongoUser?.profileImage || null);
    setLocalCoverImage(visitedMongoUser?.coverImage || null);
  }, [visitedMongoUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const showToast = externalToast || toastSet;

  useEffect(() => {
    if (coverFiles[0] && !isUploading && !previewMode) {
      const fileUrl = URL.createObjectURL(coverFiles[coverFiles.length - 1]);

      // If onReCrop is available, it means we're using the crop functionality
      if (onReCrop) {
        // Instead of showing the image preview, trigger crop dialog directly
        onReCrop("coverImage", fileUrl, [coverFiles[coverFiles.length - 1]]);
      } else {
        // Use the traditional preview dialog if no crop functionality
        showImageDialog("coverImage", fileUrl, [
          coverFiles[coverFiles.length - 1],
        ]);
      }
    }
  }, [coverFiles, isUploading, previewMode]);

  useEffect(() => {
    if (profileFiles[0] && !isUploading && !previewMode) {
      const fileUrl = URL.createObjectURL(
        profileFiles[profileFiles.length - 1]
      );

      // If onReCrop is available, it means we're using the crop functionality
      if (onReCrop) {
        // Instead of showing the image preview, trigger crop dialog directly
        onReCrop("profileImage", fileUrl, [
          profileFiles[profileFiles.length - 1],
        ]);
      } else {
        // Use the traditional preview dialog if no crop functionality
        showImageDialog("profileImage", fileUrl, [
          profileFiles[profileFiles.length - 1],
        ]);
      }
    }
  }, [profileFiles, isUploading, previewMode]);

  const handleSaveImage = async (type, files) => {
    try {
      setIsUploading(true);

      const uploadedFiles = await uploadFilesToCloudinary(
        files,
        isLandingPage ? "landingpages" : "users"
      );
      const formattedFiles = uploadedFiles.map((file) =>
        formatFileData(file, isLandingPage ? "landingpages" : "users")
      );

      const fileUrl = formattedFiles[0].fileUrl;

      if (directImageUpdate && onImageChange) {
        onImageChange(type, fileUrl);

        showToast({
          isOpen: true,
          title: t("imageUploaded"),
        });
      } else {
        const updateData = { [type]: fileUrl };

        // Also store the original image URL in the appropriate field
        if (isLandingPage) {
          updateData[
            type === "profileImage"
              ? "originalProfileImage"
              : "originalCoverImage"
          ] = fileUrl;
        }

        await update({
          col: isLandingPage ? "landingpages" : "users",
          data: { _id: mongoUser._id },
          update: updateData,
          revalidate: isLandingPage ? "/landingpages" : "/my/settings/profile",
        });

        if (type === "profileImage") {
          setLocalProfileImage(fileUrl);
        } else {
          setLocalCoverImage(fileUrl);
        }

        showToast({
          isOpen: true,
          title: t("imageSaved"),
        });
      }

      if (type === "coverImage") {
        setCoverFiles([]);
      } else {
        setProfileFiles([]);
      }
    } catch (error) {
      console.error("Error saving image:", error);
      showToast({
        isOpen: true,
        title: t("errorSavingImage"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelImage = (type) => {
    if (type === "coverImage") {
      setCoverFiles([]);
    } else {
      setProfileFiles([]);
    }
  };

  const handleDeleteImage = async (type) => {
    try {
      dialogSet({
        isOpen: true,
        title: t("deleteImageConfirmation"),
        description: t("deleteImageDescription"),
        showCancelBtn: true,
        cancelBtnText: t("cancel"),
        confirmBtnText: t("delete"),
        confirmBtnVariant: "destructive",
        action: async () => {
          setIsUploading(true);

          if (directImageUpdate && onImageChange) {
            onImageChange(type, null);

            showToast({
              isOpen: true,
              title: t("imageDeleted"),
            });
          } else {
            const updateData = {
              [type]: null,
            };

            // Also clear the original image field
            if (isLandingPage) {
              updateData[
                type === "profileImage"
                  ? "originalProfileImage"
                  : "originalCoverImage"
              ] = null;
            }

            await update({
              col: isLandingPage ? "landingpages" : "users",
              data: { _id: mongoUser._id },
              update: updateData,
              revalidate: isLandingPage
                ? "/landingpages"
                : "/my/settings/profile",
            });

            if (type === "profileImage") {
              setLocalProfileImage(null);
            } else {
              setLocalCoverImage(null);
            }

            showToast({
              isOpen: true,
              title: t("imageDeleted"),
            });
          }

          setIsUploading(false);
        },
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      showToast({
        isOpen: true,
        title: t("errorDeletingImage"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle re-cropping an existing image
  const handleReCropImage = (type) => {
    if (onReCrop) {
      onReCrop(type);
    }
  };

  const showImageDialog = (type, url, files) => {
    dialogSet({
      className: `fixed inset-0 w-screen h-screen`,
      contentClassName: `border-none max-w-full max-h-[100dvh] h-screen w-screen m-0 rounded-none`,
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: t("save"),
      isOpen: true,
      hasCloseIcon: false,
      comp: (
        <div className={`fc g20 max-w-full max-h-[85dvh] h-screen w-screen`}>
          <img
            src={url}
            alt="Preview"
            className={`wf max-w-full max-h-[85dvh] h-screen w-screen ${
              type === "profileImage" ? "" : ""
            }`}
            style={{ objectFit: "contain" }}
          />
        </div>
      ),
      action: () => handleSaveImage(type, files),
      onCancel: () => handleCancelImage(type),
    });
  };

  const canEdit =
    (!previewMode &&
      mongoUser?.isOwner &&
      (pathname === "/my/settings/profile" ||
        pathname.startsWith("/update/landingpages"))) ||
    pathname.startsWith("/add/landingpages") ||
    pathname.startsWith(ONBOARDING_ROUTE);

  const profileImg =
    profileFiles[0]?.fileUrl ||
    localProfileImage ||
    (!canEdit && "/img/noProfileImage.png");
  const coverImg = coverFiles[0]?.fileUrl || localCoverImage;

  const profileImageClass =
    previewMode && previewClasses?.profileImage
      ? previewClasses.profileImage
      : "ProfileImage";

  const coverImageClass =
    previewMode && previewClasses?.coverImage
      ? previewClasses.coverImage
      : "CoverImage";

  if (previewMode) {
    return (
      <div className="poa wf">
        <div
          className={coverImageClass}
          style={{
            backgroundImage: coverImg ? `url(${coverImg})` : "none",
            backgroundColor: coverImg
              ? "transparent"
              : customBgColor || "var(--color-brand)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            zIndex: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            minHeight: "100vh",
            borderRadius: "8px 8px 0 0",
          }}
        ></div>

        <div className={profileImageClass}>
          <div
            style={{
              backgroundImage: profileImg ? `url(${profileImg})` : "none",
              backgroundColor: profileImg
                ? "transparent"
                : customBgColor || "var(--color-brand)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="por">
      <div className="ProfileImage poa l20 t220 z10">
        <div
          className={`${
            !profileImg ? "brightness-[0.5]" : ""
          } w150 h150 br50 fcc group por`}
          style={{
            backgroundImage: profileImg ? `url(${profileImg})` : "none",
            backgroundColor: profileImg
              ? "transparent"
              : customBgColor || "var(--color-brand)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {canEdit && (
            <div className="fcc g10 poa c wf hf">
              <AddFiles
                maxFiles={1}
                files={profileFiles}
                filesSet={setProfileFiles}
                usePreview={false}
                addFilesIconClassName={`${BRAND_INVERT_CLASS}`}
                disabled={disableUpload}
              />

              {localProfileImage && (
                <>
                  {onReCrop && (
                    <div
                      onClick={() => handleReCropImage("profileImage")}
                      className={`ReCropIcon ${ICONBUTTON_CLASS} ${BRAND_INVERT_CLASS}`}
                      title={t("reCropImage")}
                    >
                      <Crop size={25} />
                    </div>
                  )}
                  <div
                    onClick={() => handleDeleteImage("profileImage")}
                    className={`TrashFilesIcon ${ICONBUTTON_CLASS} ${BRAND_INVERT_CLASS}`}
                    title={t("deleteImage")}
                  >
                    <Trash2 size={25} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="CoverImage mb70 por wf h300 br10 group"
        style={{
          backgroundImage: coverImg ? `url(${coverImg})` : "none",
          backgroundColor: coverImg
            ? "transparent"
            : customBgColor || "var(--color-brand)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {canEdit && (
          <div className="fcc g10 poa c">
            <AddFiles
              maxFiles={1}
              files={coverFiles}
              filesSet={setCoverFiles}
              usePreview={false}
              addFilesIconClassName={`${BRAND_INVERT_CLASS}`}
              disabled={disableUpload}
            />

            {localCoverImage && (
              <>
                {onReCrop && (
                  <div
                    onClick={() => handleReCropImage("coverImage")}
                    className={`ReCropIcon ${ICONBUTTON_CLASS} ${BRAND_INVERT_CLASS}`}
                    title={t("reCropImage")}
                  >
                    <Crop size={25} />
                  </div>
                )}
                <div
                  onClick={() => handleDeleteImage("coverImage")}
                  className={`TrashFilesIcon ${ICONBUTTON_CLASS} ${BRAND_INVERT_CLASS}`}
                  title={t("deleteImage")}
                >
                  <Trash2 size={25} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
