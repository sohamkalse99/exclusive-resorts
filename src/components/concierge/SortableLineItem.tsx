"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LineItem, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface SortableLineItemProps {
  item: LineItem;
  index: number;
  onRemove: (index: number) => void;
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

export default function SortableLineItem({ item, index, onRemove }: SortableLineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded ${
        isDragging ? "bg-slate-100" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xl flex-shrink-0">
          {getCategoryIcon(item.category)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">{item.title}</div>
          <div className="text-xs text-muted-foreground">
            {item.category} · {formatDateTime(item.scheduledAt)}
          </div>
          {item.description && (
            <div className="text-xs text-muted-foreground truncate">
              {item.description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-semibold text-sm">
          ${item.price.toLocaleString()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
