"use client";

import { LineItem, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface LineItemsListProps {
  items: LineItem[];
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

export default function LineItemsList({ items, onRemove }: LineItemsListProps) {
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
      <div className="divide-y">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">
                {getCategoryIcon(item.category)}
              </span>
              <div className="min-w-0">
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
        ))}
      </div>
      <div className="border-t pt-3 mt-2 flex justify-between items-center px-2">
        <span className="font-semibold text-sm">Total Estimated Cost</span>
        <span className="font-bold text-lg">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
