"use client";

// * FILE NAME: AddFilesPreviewGallery
import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Plus,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll";

const MediaPreview = ({ file }) => {
  if (file.fileType === "video" || file.fileType === "video/webm") {
    return (
      <video
        src={file.fileUrl}
        className={`w-full h-full object-cover rounded-lg`}
      />
    );
  }
  return (
    <img
      src={file.fileUrl}
      alt={file.identifier}
      className={`w-full h-full object-cover rounded-lg`}
    />
  );
};

const SortableItem = ({ file, deleteStateFile }) => {
  console.log("SortableItem file:", file);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.identifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group`}>
      <div
        onClick={() => {
          console.log("Deleting file:", file);
          deleteStateFile(file.identifier);
        }}
        className={`absolute t0 r0 z-10 bg-white rf cp p-1 shadow-md hover:bg-gray-100 transition-colors`}
      >
        <X size={16} className={`text-gray-600`} />
      </div>
      <div className={`w-24 h-24 relative`}>
        <MediaPreview file={file} />
        <div
          {...attributes}
          {...listeners}
          className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity cursor-grab active:cursor-grabbing flex items-center justify-center`}
        >
          <GripHorizontal
            className={`text-white opacity-0 group-hover:opacity-100 transition-opacity`}
            size={24}
          />
        </div>
      </div>
    </div>
  );
};

// ! AddFilesPreviewGallery
export default function AddFilesPreviewGallery({
  previews,
  deleteStateFile,
  onReorder,
}) {
  console.log("Gallery previews:", previews);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const isHovered = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Ensure both active and over exist and have valid ids
    if (!active?.id || !over?.id) {
      console.warn("Invalid drag operation - missing id", { active, over });
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = previews.findIndex(
        (item) => item.identifier === active.id
      );
      const newIndex = previews.findIndex(
        (item) => item.identifier === over.id
      );
      onReorder(arrayMove(previews, oldIndex, newIndex));
    }
  };

  // Check scroll position to show/hide navigation arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => container.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300; // Adjust this value to control scroll distance
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`w550 relative group`}>
        {/* Left Arrow */}
        {showLeftArrow && (
          <div
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors`}
          >
            <ChevronLeft size={24} className={`text-gray-600`} />
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <div
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors`}
          >
            <ChevronRight size={24} className={`text-gray-600`} />
          </div>
        )}

        <HorizontalScroll
          ref={scrollContainerRef}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
          className={`gap-4 scroll-smooth no-scrollbar`}
        >
          <SortableContext
            items={previews.map((file) => file.identifier)}
            strategy={horizontalListSortingStrategy}
          >
            {previews.map((file) => (
              <SortableItem
                key={file.identifier}
                file={file}
                deleteStateFile={deleteStateFile}
              />
            ))}
          </SortableContext>

          {/* // ! PLUS BUTTON must be NOT html button elem !!! */}
          <div
            onClick={() => document.querySelector(".AddFilesIcon").click()}
            className={`w-24 h-24 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors`}
          >
            <Plus size={24} className={`text-gray-500`} />
          </div>
        </HorizontalScroll>
      </div>
    </DndContext>
  );
}
