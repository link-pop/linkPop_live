import { update } from "./crud";

export async function updateLandingPage(landingPageId, updateData) {
  try {
    const result = await update({
      col: "landingpages",
      data: { _id: landingPageId },
      update: updateData,
      revalidate: "/landingpages",
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Error updating landing page:", error);
    throw error;
  }
}
