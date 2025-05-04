import DeleteIcon from "@/components/ui/icons/DeleteIcon";

export default function SortToggle({
  icon: Icon,
  text,
  onClick,
  hasFilter,
  onDeleteFilter,
  className = "",
}) {
  const btnClassName = "px-3 py-1 text-sm border rounded-md hover:bg-gray-100";

  return (
    <button
      className={`fcc g5 ${btnClassName} ${
        !hasFilter ? "opacity-30" : ""
      } ${className}`}
      onClick={onClick}
    >
      <Icon className="w15" /> <span>{text}</span>
      {hasFilter && (
        <DeleteIcon
          className="!w15 ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFilter();
          }}
        />
      )}
    </button>
  );
}
