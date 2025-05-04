"use client";

import { Button } from "@/components/ui/button";
import { addMongoCollectionTestItems } from "@/lib/utils/mongo/addMongoCollectionTestItems";

export default function AddMongoCollectionTestItemsButton({ col }) {
  const handleClick = async () => {
    const result = await addMongoCollectionTestItems(col);
    if (result.success) {
      alert(`20 test ${col} have been added!`);
      window.location.reload();
    } else {
      alert(`Error adding test ${col}: ${result.error}`);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-600 text-white"
    >
      add 20
    </Button>
  );
}
