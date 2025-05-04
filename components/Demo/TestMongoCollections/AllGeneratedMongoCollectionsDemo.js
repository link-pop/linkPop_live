import Posts from "@/components/Post/Posts/Posts";
import AddMongoCollectionTestItems from "./AddMongoCollectionTestItems";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export default async function AllGeneratedMongoCollectionsDemo() {
  const cols = await getAllMongoCollectionsData();
  const { isAdmin } = await getMongoUser();

  return (
    <div>
      <AddMongoCollectionTestItems />
      {/* // ! Collection Posts */}
      {cols.map(
        (col, i) =>
          // Skip read only collections and footer collections
          col.settings.navPlace !== "footer" && (
            <Posts
              key={col.name}
              {...{
                col,
                isDefaultSearch: false,
                className: `mah500 mb200 wfc mxa br10`,
              }}
            />
          )
      )}
    </div>
  );
}
