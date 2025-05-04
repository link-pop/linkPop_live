import mongoose from "mongoose";
import ArraySearchInputClient from "./ArraySearchInputClient";

export default async function ArraySearchInputServer({
  col,
  nameInSearchParams,
  searchParams,
}) {
  // get eg. all unique tags
  const uniqueOptions = (
    await mongoose.model(col.name).distinct(nameInSearchParams)
  ).filter(
    (option) => option !== "" && option !== null && option !== undefined
  );

  return (
    <ArraySearchInputClient
      col={col}
      nameInSearchParams={nameInSearchParams}
      searchParams={searchParams}
      defaultValue={uniqueOptions}
      defaultSelectedValue={searchParams?.[nameInSearchParams] || ""}
    />
  );
}
