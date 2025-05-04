"use server";

import mongoose from "mongoose";
import LocationSearchInputClient from "./LocationSearchInputClient";

export default async function LocationSearchInputServer({
  col,
  nameInSearchParams,
  searchParams,
}) {
  // Check if this is a state input
  const isStateInput =
    col?.settings?.fields?.[nameInSearchParams]?.subtype === "state";

  // For state input, we need the country value from the related country field
  const countryFieldName = isStateInput
    ? nameInSearchParams.replace(" state", "")
    : nameInSearchParams;
  const stateFieldName = isStateInput
    ? nameInSearchParams
    : `${nameInSearchParams} state`;

  // Fetch unique locations using distinct
  const uniqueCountries = isStateInput
    ? []
    : await mongoose.model(col.name).distinct(countryFieldName);

  const uniqueStates = isStateInput
    ? await mongoose.model(col.name).distinct(stateFieldName)
    : [];

  return (
    <LocationSearchInputClient
      col={col}
      nameInSearchParams={nameInSearchParams}
      searchParams={searchParams}
      uniqueCountries={uniqueCountries}
      uniqueStates={uniqueStates}
      isStateInput={isStateInput}
      defaultCountry={searchParams?.[countryFieldName] || ""}
      defaultState={searchParams?.[stateFieldName] || ""}
    />
  );
}
