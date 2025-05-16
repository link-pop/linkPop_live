"use client";

import NoPosts from "@/components/Post/Posts/NoPosts";
import QueuedItem from "./QueuedItem";

export default function QueuedItemsList({
  items = [],
  type = "post",
  isLoading,
  onSelect,
  selectedItem,
}) {
  if (!items?.length && !isLoading) {
    return <NoPosts col={{ name: type }} />;
  }

  return (
    <div className="fc g0">
      {items.map((item) => (
        <QueuedItem
          key={item._id}
          item={item}
          type={type}
          onSelect={onSelect}
          selected={selectedItem && selectedItem._id === item._id}
        />
      ))}
    </div>
  );
}
