"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LineItem } from "@/lib/constants";
import { Plus } from "lucide-react";

interface AddItemFormProps {
  category: string;
  arrivalDate: string;
  departureDate: string;
  onAdd: (item: LineItem) => void;
  onCancel: () => void;
}

export default function AddItemForm({
  category,
  arrivalDate,
  departureDate,
  onAdd,
  onCancel,
}: AddItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(arrivalDate);
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt || !price) return;

    onAdd({
      category,
      title,
      description,
      scheduledAt,
      price: parseFloat(price),
    });

    setTitle("");
    setDescription("");
    setScheduledAt(arrivalDate);
    setPrice("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border rounded-lg p-4 mt-4"
    >
      <h4 className="font-semibold text-sm mb-3">
        Add {category} Item
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="title" className="text-xs">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Private Chef Dinner"
            required
          />
        </div>
        <div>
          <Label htmlFor="price" className="text-xs">
            Estimated Price ($) *
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="scheduledAt" className="text-xs">
            Date & Time *
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            min={arrivalDate + "T00:00"}
            max={departureDate + "T23:59"}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-xs">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
            rows={1}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button type="submit" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
