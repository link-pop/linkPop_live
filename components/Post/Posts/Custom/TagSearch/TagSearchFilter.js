"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, FunnelPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserPopularTags } from "@/hooks/useUserPopularTags";
import SearchTag from "@/components/ui/shared/SearchTag/SearchTag";

export default function TagSearchFilter({
  visitedUserId,
  isOwner = false,
  onTagsChange = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get popular tags from user's attachments
  const {
    tags: userPopularTags,
    isLoading: isLoadingUserTags,
    error: userTagsError,
  } = useUserPopularTags(visitedUserId, 50);

  // Initialize selected tags from URL params
  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      const tags = tagsParam.split(",").filter((tag) => tag.trim());
      setSelectedTags(tags);
    } else {
      // Clear tags if no tags parameter in URL
      setSelectedTags([]);
    }
  }, [searchParams]);

  // Filter suggested tags based on search input
  const filteredSuggestions = useMemo(() => {
    if (!searchInput.trim() || !userPopularTags) return [];

    const input = searchInput.toLowerCase();
    return userPopularTags
      .filter((tag) => tag.includes(input) && !selectedTags.includes(tag))
      .slice(0, 10);
  }, [searchInput, selectedTags, userPopularTags]);

  // Handle adding a tag
  const addTag = (tag) => {
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    setSearchInput("");
    updateURL(newTags);

    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Handle removing a tag
  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    updateURL(newTags);

    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Handle clearing all tags
  const clearAllTags = () => {
    setSelectedTags([]);
    updateURL([]);

    if (onTagsChange) {
      onTagsChange([]);
    }
  };

  // Update URL with selected tags
  const updateURL = (tags) => {
    const params = new URLSearchParams(searchParams);

    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    } else {
      params.delete("tags");
    }

    // Preserve other search params
    const newURL = `${window.location.pathname}?${params.toString()}`;
    console.log("TagSearchFilter - Updating URL to:", newURL);
    console.log("TagSearchFilter - Selected tags:", tags);

    // Use replace instead of push to avoid navigation issues
    router.replace(newURL, { scroll: false });
  };

  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      const tag = searchInput.trim().toLowerCase();
      if (!selectedTags.includes(tag)) {
        addTag(tag);
      }
    }
  };

  // Handle icon click to trigger enter keypress
  const handleIconClick = () => {
    if (searchInput.trim()) {
      const tag = searchInput.trim().toLowerCase();
      if (!selectedTags.includes(tag)) {
        addTag(tag);
      }
    }
  };

  // Don't render anything if user has no tags (moved after all hooks)
  if (!userPopularTags || userPopularTags.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-4 p-4 bg-background border border-border rounded-lg">
      {/* Search Input */}
      <div className="relative mb-3 z-50">
        <div className="relative">
          {searchInput.trim() ? (
            <FunnelPlus
              className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 w18 h18 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={handleIconClick}
            />
          ) : (
            <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type to search tags"
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Tag Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full px-4 py-2 text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Selected Tags ({selectedTags.length})
            </span>
            <button
              onClick={clearAllTags}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <SearchTag
                key={tag}
                text={tag}
                onRemove={removeTag}
                variant="primary"
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          {isLoadingUserTags && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {userPopularTags.slice(0, 15).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={selectedTags.includes(tag)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
