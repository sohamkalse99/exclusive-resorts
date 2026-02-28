"use client";

import { LineItem, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableLineItem from "./SortableLineItem";

interface LineItemsListProps {
  items: LineItem[];
  onRemove: (index: number) => void;
  onReorder?: (items: LineItem[]) => void;
}

function getCategoryIcon(category: string) {
  return CATEGORIES.find((c) => c.name === category)?.icon || "📋";
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LineItemsList({ items, onRemove, onReorder }: LineItemsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = active.id;
      const newIndex = over.id;
      const newItems = arrayMove(items, oldIndex, newIndex);
      if (onReorder) {
        onReorder(newItems);
      }
    }
  };
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No items added yet.</p>
        <p className="text-xs mt-1">Select a category above to start building the itinerary.</p>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((_, index) => index)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y">
            {items.map((item, index) => (
              <SortableLineItem
                key={index}
                item={item}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="border-t pt-3 mt-2 flex justify-between items-center px-2">
        <span className="font-semibold text-sm">Total Estimated Cost</span>
        <span className="font-bold text-lg">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
