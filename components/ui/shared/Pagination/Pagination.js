import PaginationBase from "@/components/ui/shared/Pagination/PaginationBase";
import FirstPage from "./FirstPage";
import LastPage from "./LastPage";
import { cn } from "@/lib/utils";

export default function Pagination(props) {
  const { className = "" } = props;

  return (
    <div className={cn("fcc", className)}>
      <FirstPage {...props} />
      <div>
        <PaginationBase {...props} />
      </div>
      <LastPage {...props} />
    </div>
  );
}
