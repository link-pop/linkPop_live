import Switch from "@/components/ui/shared/Switch/Switch";
import { getAllFieldsInMongoCollection } from "@/lib/utils/mongo/getAllFieldsInMongoCollection";
import AddPostFormInputArray from "./AddPostFormInputArray";
import AddPostFormInputStringNumber from "./AddPostFormInputStringNumber";
import { SmartDatetimeInput } from "@/components/ui/shared/SmartDatetimeInput/SmartDatetimeInput";
import TipTapInput from "@/components/Post/AddPost/AddPostFormInput/TipTapInput";
import LocationSelector from "@/components/ui/shared/LocationSelector/LocationSelector";
import { useFormFieldOrder } from "@/components/Post/AddPost/AddPostFormInput/useFormFieldOrder";
import { getSkipFieldsForCollection } from "@/lib/utils/mongo/_settingsSkipInputRenderAddPostForm";
import AddPostFormInputBoolean from "./AddPostFormInputBoolean";

export default async function AddPostFormInputs({ col, updatingPost }) {
  let allFieldNamesAndTypesInCol = await getAllFieldsInMongoCollection(col);
  // * remove files and hidden fields from allFieldNamesAndTypesInCol
  allFieldNamesAndTypesInCol = allFieldNamesAndTypesInCol.filter(
    (field) =>
      // field.name !== "likes" &&
      // field.name !== "views" &&
      field.name !== "files" &&
      !col?.settings?.fields?.[field.name]?.isHidden &&
      !col?.settings?.fields?.[field.name]?.isHiddenForAddPost &&
      !getSkipFieldsForCollection(col.name).includes(field.name)
  );

  // * defaultValue
  const defaultValue = (field) =>
    updatingPost?.[field.name] !== undefined
      ? updatingPost[field.name] // can return false (needed for boolean fields)
      : field.defaultValue;

  // * getLabel
  const getLabel = (field) =>
    col?.settings?.fields?.[field.name]?.displayName || field.name;

  // * renderInputs
  const renderInputs = () => {
    // First, get all location-related fields
    const locationFields = allFieldNamesAndTypesInCol.filter((field) => {
      const subtype = col?.settings?.fields?.[field.name]?.subtype;
      return subtype === "country" || subtype === "state";
    });

    // * inputs
    const inputs = [
      // Location inputs - only render country fields, their states will be handled internally
      ...locationFields
        .filter(
          (field) => col?.settings?.fields?.[field.name]?.subtype === "country"
        )
        .map((field) => {
          const stateField = locationFields.find(
            (f) =>
              col?.settings?.fields?.[f.name]?.subtype === "state" &&
              f.name === `${field.name} state`
          );

          return (
            <LocationSelector
              key={field.name}
              name={field.name}
              required={field.required}
              className={col?.settings?.fields?.[field.name]?.className || ""}
              defaultValue={{
                country: updatingPost?.[field.name] || "",
                state: stateField ? updatingPost?.[stateField.name] || "" : "",
              }}
              hideState={col?.settings?.fields?.[field.name]?.hideState}
              isStateOnly={false}
              label={getLabel(field)}
              stateRequired={stateField?.required}
            />
          );
        }),
      // * Text inputs
      ...allFieldNamesAndTypesInCol
        .filter(
          (field) => col?.settings?.fields?.[field.name]?.subtype === "text"
        )
        .map((field) => (
          <TipTapInput
            key={field.name}
            name={field.name}
            defaultValue={updatingPost?.[field.name]}
            placeholder={`Enter ${field.name}...`}
            required={field.required}
            label={getLabel(field)}
            className={col?.settings?.fields?.[field.name]?.className || ""}
          />
        )),
      // * String/Number inputs
      ...allFieldNamesAndTypesInCol
        .filter((field) => field.type === "String" || field.type === "Number")
        .map((field) => (
          <AddPostFormInputStringNumber
            key={field.name}
            name={field.name}
            label={getLabel(field)}
            type={field.type}
            required={field.required}
            defaultValue={defaultValue(field)}
            fieldSettings={col.settings?.fields?.[field.name]}
            subtype={col.settings?.fields?.[field.name]?.subtype}
            className={col?.settings?.fields?.[field.name]?.className || ""}
          />
        )),
      // * Boolean inputs
      ...allFieldNamesAndTypesInCol
        .filter((field) => field.type === "Boolean")
        .map((field) => (
          <AddPostFormInputBoolean
            key={field.name}
            col={col}
            name={field.name}
            required={field.required}
            label={getLabel(field)}
            defaultValue={defaultValue(field)}
            className={col?.settings?.fields?.[field.name]?.className || ""}
          />
        )),
      // * Array inputs
      <AddPostFormInputArray
        key="array-inputs"
        {...{ allFieldNamesAndTypesInCol, updatingPost, col }}
      />,
      // * Date inputs
      ...allFieldNamesAndTypesInCol
        .filter((field) => field.type === "Date")
        .map((field) => (
          <SmartDatetimeInput
            key={field.name}
            name={field.name}
            defaultValue={defaultValue(field)}
            label={getLabel(field)}
            className={col?.settings?.fields?.[field.name]?.className || ""}
          />
        )),
    ];

    return useFormFieldOrder(inputs, col?.settings);
  };

  return <div className="fc aic g25 maw999 wf fui">{renderInputs()}</div>;
}
