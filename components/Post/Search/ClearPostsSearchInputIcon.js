import DeleteIcon from "@/components/ui/icons/DeleteIcon";
import { useRouter } from "next/navigation";

export default function ClearPostsSearchInputIcon({
  searchParams,
  nameInSearchParams,
  handleClearState,
  col,
  className = "",
}) {
  const router = useRouter();

  const handleClear = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(nameInSearchParams);
    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
    handleClearState?.();
  };

  const hasSearchParam = searchParams[nameInSearchParams];

  return (
    <>
      {hasSearchParam && (
        <div className={`ml6 ${className}`} onClick={handleClear}>
          <DeleteIcon />
        </div>
      )}
    </>
  );
}
