"use server";

import { ObjectId } from "mongodb";
import { update, add } from "./crud";
import getMongoUser from "../utils/mongo/getMongoUser";
import uploadFilesToCloudinary from "@/components/Cloudinary/uploadFilesToCloudinary";
import { formatAttachmentData } from "@/lib/utils/files/formatFileData";

export async function handleWelcomeMessage(submittedInfo) {
  try {
    // Handle file uploads if they exist (client-side functionality)
    let uploadedFiles = [];
    if (submittedInfo.files?.length > 0 && typeof window !== "undefined") {
      uploadedFiles = await uploadFilesToCloudinary(
        submittedInfo.files,
        "welcomeMessage"
      );

      // Create attachment records for new files
      for (const file of uploadedFiles) {
        const attachmentData = formatAttachmentData(
          file,
          "welcomeMessage",
          submittedInfo.mongoUser?._id
        );

        await add({
          col: { name: "attachments" },
          data: attachmentData,
        });
      }

      // Update the submittedInfo with the uploaded files
      submittedInfo = {
        ...submittedInfo,
        files: uploadedFiles,
      };
    }

    // Get mongoUser if not provided (server-side functionality)
    let mongoUser = submittedInfo.mongoUser;
    if (!mongoUser) {
      const result = await getMongoUser();
      mongoUser = result.mongoUser;
    }

    const welcomeMessageData = {
      chatMsgText: submittedInfo.tipTapInputContent || "",
      files: submittedInfo.files || [], // Files are now properly formatted with all fields
      expirationPeriod: submittedInfo.expirationPeriod || null,
      scheduleAt: submittedInfo.scheduleAt || null,
      createdBy: new ObjectId(mongoUser._id),
    };

    await update({
      col: "users",
      data: { _id: new ObjectId(mongoUser._id) },
      update: { welcomeMessage: welcomeMessageData },
      revalidate: "/my/settings/messaging"
    });

    return { success: true };
  } catch (error) {
    console.error("Welcome message error:", error);
    return { success: false, error: error.message };
  }
}
