import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import AddMongoCollectionTestItemsButton from "./AddMongoCollectionTestItemsButton";
import DeleteMongoCollectionTestItemsButton from "./DeleteMongoCollectionTestItemsButton";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export default async function AddMongoCollectionTestItems() {
  const cols = await getAllMongoCollectionsData();
  const { isAdmin, isDev } = await getMongoUser();

  return (
    isDev && (
      <>
        <div className="t_1 wf tac gray">* admin area</div>
        <div className="fcc g15">
          {cols.map((col) => {
            // ! Skip some collections
            if (col.settings.navPlace === "footer") return null;

            return (
              <div key={`actions-${col.name}`} className="fc aic g10">
                <div>{col.name}</div>
                <AddMongoCollectionTestItemsButton col={col.name} />
                <DeleteMongoCollectionTestItemsButton col={col.name} />
              </div>
            );
          })}
        </div>
      </>
    )
  );
}
