export default function PostAutoGenMongoFields(props) {
  return null;
  // this component is mainly for testing to display all fields of a mongo model (schema)
  // delete some fields (some can crash this component)
  const {
    updatedAt,
    createdAt,
    createdBy,
    files,
    _id,
    col,
    tags,
    text,
    ...restProps
  } = props;

  return (
    <>
      {Object.keys(restProps).map((key) => {
        const value = restProps[key];
        let displayValue;

        if (
          Array.isArray(value) &&
          value.every((item) => typeof item === "object")
        ) {
          // Extract 'value' from each object and join them with a comma
          displayValue = value.map((item) => item.value).join(", ");
        } else {
          // Convert other types to string
          displayValue = value?.toString();
        }

        const displayName = col?.settings?.fields?.[key]?.displayName || key;

        return (
          <div key={key} title={displayValue} className="fui">
            <span className="fw600">{displayName}:</span> {displayValue}
          </div>
        );
      })}
    </>
  );
}
