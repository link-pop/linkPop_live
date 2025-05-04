import DateSearchInputClient from "./DateSearchInputClient";
import { getMongoCollectionDateFieldRanges } from "@/lib/utils/mongo/getMongoCollectionDateFieldRanges";

export default async function DateSearchInputServer({
  col,
  nameInSearchParams,
  searchParams,
}) {
  const { minDate, maxDate } = await getMongoCollectionDateFieldRanges(
    col.name,
    nameInSearchParams
  );

  return (
    <DateSearchInputClient
      col={col}
      nameInSearchParams={nameInSearchParams}
      searchParams={searchParams}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}
