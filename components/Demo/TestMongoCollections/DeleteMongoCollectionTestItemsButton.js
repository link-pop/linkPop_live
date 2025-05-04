"use client";

import { Button } from "@/components/ui/button";
import { removeAll } from "@/lib/actions/crud";

export default function DeleteMongoCollectionTestItemsButton({ col }) {
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete all ${col}?`)) {
      try {
        const result = await removeAll(col);
        if (result.success) {
          alert(`All ${col} have been deleted!`);
          window.location.reload();
        } else {
          alert(`Error deleting ${col}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error deleting ${col}:`, error);
        alert(`Error deleting ${col}`);
      }
    }
  };

  return (
    <Button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-600 text-white"
    >
      delete all
    </Button>
  );
}
