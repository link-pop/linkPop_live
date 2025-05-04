import AddPostFormWithInputs from "@/components/Post/AddPost/AddPostFormWithInputs";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import { checkCollectionAccess } from "@/lib/utils/mongo/checkCollectionAccess";
import AddFeedChatmessageForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddFeedChatmessageForm";
import { SITE1, SITE2 } from "@/config/env";
import AddDirectlinkForm from "@/components/Post/AddPostCustom/LinkPop/AddDirectlinkForm";
import AddLandingPageForm from "@/components/Post/AddPostCustom/LinkPop/AddLandingPageForm";

export default async function addPostPage({ params }) {
  const { mongoUser, isDev } = await getMongoUser();
  const col = await getAllMongoCollectionsData(params.col);
  // TODO !! await checkCollectionAccess({ col, place: "addPost" });

  // Check the specific collection name from params
  if (SITE1) {
    return <AddFeedChatmessageForm {...{ col, mongoUser }} />;
  } else {
    // For SITE2, properly check which collection we're dealing with
    if (params.col === "directlinks") {
      return <AddDirectlinkForm {...{ col, mongoUser }} />;
    } else if (params.col === "landingpages") {
      return <AddLandingPageForm {...{ col, mongoUser }} />;
    } else {
      // Fallback to generic form for other collections
      return <AddPostFormWithInputs {...{ col, mongoUser, isDev }} />;
    }
  }
}
