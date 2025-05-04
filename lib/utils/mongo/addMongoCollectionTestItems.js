"use server";

import { add } from "@/lib/actions/crud";
import { getAllFieldsInMongoCollection } from "@/lib/utils/mongo/getAllFieldsInMongoCollection";

const sampleImages = [
  "https://picsum.photos/400/400?random=1",
  "https://picsum.photos/400/400?random=2",
  "https://picsum.photos/400/400?random=3",
  "https://picsum.photos/400/400?random=4",
  "https://picsum.photos/400/400?random=5",
  "https://picsum.photos/400/400?random=6",
  "https://picsum.photos/400/400?random=7",
  "https://picsum.photos/400/400?random=8",
  "https://picsum.photos/400/400?random=9",
  "https://picsum.photos/400/400?random=10",
  "https://picsum.photos/400/400?random=11",
  "https://picsum.photos/400/400?random=12",
  "https://picsum.photos/400/400?random=13",
  "https://picsum.photos/400/400?random=14",
  "https://picsum.photos/400/400?random=15",
];

function getRandomImages(count, index) {
  const shuffled = [...sampleImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((url, i) => ({
    fileUrl: url,
    fileName: `test-image-${index}-${i + 1}.jpg`,
  }));
}

function generateValueByType(type, fieldName, index) {
  // Special handling for 'files' field
  if (fieldName === "files") {
    return getRandomImages(3, index);
  }

  switch (type) {
    case "String":
      return `Test ${fieldName} ${index}`;
    case "Number":
      if (fieldName === "price") {
        return Math.floor(Math.random() * 10000) / 100; // Generate prices like 99.99
      }
      if (fieldName === "quantity") {
        return Math.floor(Math.random() * 100); // 0-99 for quantity
      }
      return Math.floor(Math.random() * 1000) + 1;
    case "Boolean":
      return Math.random() > 0.5;
    // select (SelectMulti)
    case "Array":
      return [
        { value: `${fieldName}${index}`, label: `${fieldName}${index}` },
        {
          value: `${fieldName}${index + 1}`,
          label: `${fieldName}${index + 1}`,
        },
        {
          value: `${fieldName}${index + 2}`,
          label: `${fieldName}${index + 2}`,
        },
      ];
    case "Date":
      // Generate random date within -1 to +1 year from now
      const now = new Date();
      const oneYearAgo = new Date();
      const oneYearFromNow = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      return new Date(
        oneYearAgo.getTime() +
          Math.random() * (oneYearFromNow.getTime() - oneYearAgo.getTime())
      );
    case "ObjectID":
      return null;
    default:
      return `Default Value ${index}`;
  }
}

async function generateTestItem(col, index, fields) {
  const data = {
    col,
  };

  // Generate values for all other fields
  fields.forEach((field) => {
    data[field.name] = generateValueByType(field.type, field.name, index);
  });

  return {
    col,
    data,
  };
}

export async function addMongoCollectionTestItems(col) {
  try {
    const fields = await getAllFieldsInMongoCollection(col);
    console.log("Fields from schema:", fields);

    const items = [];
    for (let i = 1; i <= 20; i++) {
      const item = await generateTestItem(col, i, fields);
      console.log("Generated item:", item);
      const result = await add(item);
      if (!result) {
        throw new Error(`Failed to add item ${i}`);
      }
      items.push(result);
    }

    console.log(`Successfully added ${items.length} items`);
    return { success: true };
  } catch (error) {
    console.error(`Error adding test ${col}:`, error);
    return { success: false, error: error.message };
  }
}
