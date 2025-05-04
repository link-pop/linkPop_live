"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Pagination from "../../ui/shared/Pagination/Pagination";
import { useUrlParams } from "@/hooks/useUrlParams";

export default function PostsPagination({ col, totalPages }) {
  if (totalPages <= 1) return;

  const router = useRouter();
  const urlParams = useUrlParams();
  const [page, setPage] = useState(parseInt(urlParams.get("page"), 10) || 1);

  useEffect(() => {
    // Update page state when url params change
    setPage(parseInt(urlParams.get("page"), 10) || 1);
  }, [urlParams]);

  const updatePage = (newPage) => {
    const params = new URLSearchParams(urlParams.toString());
    params.set("page", newPage);
    router.push(`${col.name.toLowerCase()}?${params.toString()}`);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      updatePage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      updatePage(page + 1);
    }
  };

  return (
    <Pagination
      className="mta"
      {...{ page, handlePrevPage, handleNextPage, updatePage, totalPages }}
    />
  );
}
