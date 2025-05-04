import { add } from "./crud";

export async function addLandingPage(landingPageData) {
  try {
    const result = await add({
      col: "landingpages",
      data: landingPageData,
      revalidate: "/landingpages",
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Error adding landing page:", error);
    throw error;
  }
}
