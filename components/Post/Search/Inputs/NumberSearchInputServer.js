import NumberSearchInputClient from "./NumberSearchInputClient";
import { getMongoCollectionNumericFieldRanges } from "@/lib/utils/mongo/getMongoCollectionNumericFieldRanges";

export default async function NumberSearchInputServer({
  col,
  nameInSearchParams,
  searchParams,
}) {
  const { min, max } = await getMongoCollectionNumericFieldRanges(col);

  return (
    <NumberSearchInputClient
      col={col}
      nameInSearchParams={nameInSearchParams}
      searchParams={searchParams}
      min={min ? min[nameInSearchParams] : undefined}
      max={max ? max[nameInSearchParams] : undefined}
    />
  );
}
