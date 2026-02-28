"use client";

import { CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/card";

interface CategoryCardsProps {
  selectedCategory: string | null;
  onSelect: (category: string) => void;
}

export default function CategoryCards({
  selectedCategory,
  onSelect,
}: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {CATEGORIES.map((cat) => (
        <Card
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={`cursor-pointer p-4 text-center transition-all hover:shadow-md hover:scale-[1.02] ${
            selectedCategory === cat.name
              ? "ring-2 ring-slate-900 bg-slate-50"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="text-3xl mb-2">{cat.icon}</div>
          <div className="font-semibold text-sm">{cat.name}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-tight">
            {cat.examples}
          </div>
        </Card>
      ))}
    </div>
  );
}
