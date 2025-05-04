import { ChevronLeftIcon } from "lucide-react";

export default function FirstPage(props) {
  return (
    <div className="fcc cp" onClick={() => props.updatePage(1)}>
      <ChevronLeftIcon className="h-4 w-4 r -right-[8px]" />
      <ChevronLeftIcon className="h-4 w-4" />
      <span>First</span>
    </div>
  );
}
