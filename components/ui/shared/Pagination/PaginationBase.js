import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationBase({
  page,
  handlePrevPage,
  handleNextPage,
  updatePage,
  totalPages,
}) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={handlePrevPage} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink onClick={() => updatePage(page)}>
            {page}
          </PaginationLink>
        </PaginationItem>
        {page + 1 <= totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => updatePage(page + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {page + 2 <= totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => updatePage(page + 2)}>
              {page + 2}
            </PaginationLink>
          </PaginationItem>
        )}
        {page + 2 < totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext onClick={handleNextPage} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
