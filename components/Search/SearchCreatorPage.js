"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import SearchCreatorForm from "@/components/Search/SearchCreatorForm";
import SearchCreatorResults from "@/components/Search/SearchCreatorResults";

export default function SearchCreatorPage({ mongoUser }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [shouldClearResults, setShouldClearResults] = useState(false);

  // Handle search form submission - wrapped in useCallback to prevent re-creation
  const handleSearch = useCallback((newSearchParams) => {
    setSearchParams(newSearchParams);
    setIsSearching(true);
    setShouldClearResults(false); // Reset clear flag when new search is performed
  }, []);

  // Handle search completion - wrapped in useCallback to prevent re-creation
  const handleSearchComplete = useCallback(() => {
    setIsSearching(false);
  }, []);

  // Handle Clear All - wrapped in useCallback to prevent re-creation
  const handleClearAll = useCallback(() => {
    setSearchParams({});
    setShouldClearResults(true);
    setIsSearching(false);
  }, []);

  // Handle clear complete - wrapped in useCallback to prevent re-creation
  const handleClearComplete = useCallback(() => {
    setShouldClearResults(false);
  }, []);

  // Handle search parameter updates (for tag removal) - wrapped in useCallback to prevent re-creation
  const handleUpdateSearchParams = useCallback((newSearchParams) => {
    setSearchParams(newSearchParams);
    setIsSearching(true);
    setShouldClearResults(false);
  }, []);

  if (!mongoUser?._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-foreground/60">
            {t("pleaseLoginToSearch") || "Please login to search creators"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="maw1000 wf mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form - Left Column */}
          <div className="lg:col-span-1">
            <div className="pt50 sticky top-0">
              <SearchCreatorForm
                mongoUser={mongoUser}
                onSearch={handleSearch}
                isSearching={isSearching}
                onClearAll={handleClearAll}
                externalSearchParams={searchParams}
              />
            </div>
          </div>

          {/* Search Results - Right Column */}
          <div className="lg:col-span-2">
            <SearchCreatorResults
              mongoUser={mongoUser}
              searchParams={searchParams}
              onSearchComplete={handleSearchComplete}
              shouldClearResults={shouldClearResults}
              onClearComplete={handleClearComplete}
              onUpdateSearchParams={handleUpdateSearchParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
