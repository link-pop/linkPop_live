import StringSearchInput from "./Inputs/StringSearchInput";
import BooleanSearchInput from "./Inputs/BooleanSearchInput";
import ArraySearchInputServer from "./Inputs/ArraySearchInputServer";
import NumberSearchInputServer from "./Inputs/NumberSearchInputServer";
import DateSearchInputServer from "./Inputs/DateSearchInputServer";
import LocationSearchInputServer from "./Inputs/LocationSearchInputServer";

export default async function PostsSearchInput({
  col,
  nameInSearchParams,
  searchParams,
  type,
}) {
  return (
    <div>
      {col?.settings?.fields?.[nameInSearchParams]?.subtype === "country" ? (
        <LocationSearchInputServer
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : type === "String" ? (
        <StringSearchInput
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : type === "Number" ? (
        <NumberSearchInputServer
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : type === "Boolean" ? (
        <BooleanSearchInput
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : type === "Array" ? (
        <ArraySearchInputServer
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : type === "Date" ? (
        <DateSearchInputServer
          col={col}
          nameInSearchParams={nameInSearchParams}
          searchParams={searchParams}
        />
      ) : null}
    </div>
  );
}
