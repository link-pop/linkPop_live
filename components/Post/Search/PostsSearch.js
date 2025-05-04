import { getAllFieldsInMongoCollection } from "@/lib/utils/mongo/getAllFieldsInMongoCollection";
import SearchSheetWithMongoCollectionInputs from "./SearchSheetWithMongoCollectionInputs";
import SearchParamsReset from "./SearchParamsReset";
import PostsSearchFromOtherPage from "./FromOtherPage/PostsSearchFromOtherPage";
import SearchParamsTags from "./SearchParamsTags";
import TopUsedSearchOptions from "./TopUsedSearchOptions";

export default async function PostsSearch({
  searchParams,
  col,
  isDefaultSearch,
}) {
  let allFieldNamesAndTypesInCol = await getAllFieldsInMongoCollection(col);
  // remove files from search
  allFieldNamesAndTypesInCol = allFieldNamesAndTypesInCol.filter(
    (field) => field.name !== "files" && field.name !== "active"
  );

  return (
    <div className="👋 fc">
      {isDefaultSearch ? (
        <div className="fc">
          <SearchSheetWithMongoCollectionInputs
            {...{ col, searchParams, allFieldNamesAndTypesInCol }}
          />
          <div className="fcc g10 mt10 maw900 mxa">
            <TopUsedSearchOptions {...{ col }} />

            <SearchParamsTags
              {...{
                col,
                searchParams,
                allFieldNamesAndTypesInCol,
              }}
            />
            <SearchParamsReset {...{ col, searchParams }} />
          </div>
        </div>
      ) : (
        <PostsSearchFromOtherPage {...{ col }} />
      )}
    </div>
  );
}
