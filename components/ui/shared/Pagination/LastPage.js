import { ChevronRightIcon } from "lucide-react";
export default function LastPage(props) {
  return (
    <div className="fcc cp" onClick={() => props.updatePage(props.totalPages)}>
      <span>Last</span>
      <ChevronRightIcon className="h-4 w-4" />
      <ChevronRightIcon className="h-4 w-4 r -left-[8px]" />
    </div>
  );
}
