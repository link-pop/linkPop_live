"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const categories = [
  { id: "windows", title: "Windows", image: "/img/category/windows.svg" },
  { id: "office", title: "Office", image: "/img/category/office.svg" },
  {
    id: "adobe photoshop",
    title: "Adobe Photoshop",
    image: "/img/category/photoshop.svg",
  },
  {
    id: "adobe illustrator",
    title: "Adobe Illustrator",
    image: "/img/category/illustrator.svg",
  },
  { id: "other", title: "Other", image: "/img/category/other.svg" },
];

export default function CategoryToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");

  const handleCategoryClick = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (currentCategory === categoryId) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="👋 p15 flex gap-4 flex-wrap justify-center">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={`tac relative group flex flex-col items-center p-2 rounded-lg transition-all ${
            currentCategory === category.id
              ? "bg-blue-100 scale-105"
              : "hover:bg-gray-100"
          }`}
        >
          <div className="w-16 h-16 relative">
            <Image
              src={category.image}
              alt={category.title}
              fill
              className="object-contain"
            />
          </div>
          <span className="w80 mt-2 text-sm font-medium text-gray-700">
            {category.title}
          </span>
        </button>
      ))}
    </div>
  );
}
