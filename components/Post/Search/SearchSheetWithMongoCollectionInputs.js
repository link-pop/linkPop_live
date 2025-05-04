import Sheet from "@/components/ui/shared/Sheet/Sheet";
import PostsSearchInput from "./PostsSearchInput";
import PostsSearchFromOtherPage from "./FromOtherPage/PostsSearchFromOtherPage";
import PostsSort from "./PostsSort";

export default async function SearchSheetWithMongoCollectionInputs({
  col,
  searchParams,
  allFieldNamesAndTypesInCol,
}) {
  // README 1.2
  return (
    <Sheet
      sheetTrigger={<PostsSearchFromOtherPage {...{ col }} />}
      sheetContentClassName="oya !w-[360px] !max-w-[360px]"
      title={`Search ${col.name}`}
    >
      <div className="👋 fc g15 mt10">
        <PostsSort
          {...{
            col,
            searchParams,
            allFieldNamesAndTypesInCol,
          }}
        />

        {allFieldNamesAndTypesInCol
          // ! skip hidden fields and fields hidden from search
          .filter(
            (field) =>
              !col.settings?.fields?.[field.name]?.isHidden &&
              !col.settings?.fields?.[field.name]?.isHiddenForSearch
          )
          .map((field) => (
            <PostsSearchInput
              key={field.name}
              col={col}
              nameInSearchParams={field.name}
              searchParams={searchParams}
              type={field.type}
            />
          ))}
      </div>
    </Sheet>
  );
}
