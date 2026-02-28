"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProposalData, ProposalItemData, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  Calendar,
  Home,
  Clock,
  Sparkles,
} from "lucide-react";

function getCategoryIcon(category: string) {
  return CATEGORIES.find((c) => c.name === category)?.icon || "📋";
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatItemDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatItemTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupItemsByDate(items: ProposalItemData[]) {
  const groups: Record<string, ProposalItemData[]> = {};
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  for (const item of sorted) {
    const date = new Date(item.scheduledAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

export default function ProposalPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposals/${params.id}`);
      if (!res.ok) throw new Error("Proposal not found");
      const data = await res.json();
      setProposal(data);
    } catch {
      setError("Proposal not found or unavailable.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const handleStatusUpdate = async (newStatus: "approved" | "paid") => {
    if (!proposal) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();

      setProposal((prev) => (prev ? { ...prev, status: updated.status } : prev));

      if (newStatus === "paid") {
        setShowConfirmation(true);
      }
    } catch {
      console.error("Error updating proposal status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-light text-stone-800 mb-2">
            Proposal Not Found
          </h2>
          <p className="text-stone-500">{error}</p>
        </div>
      </div>
    );
  }

  // Confirmation Screen
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-4xl font-light text-white mb-4 tracking-wide">
            You&apos;re All Set
          </h1>
          <p className="text-stone-400 text-lg font-light leading-relaxed mb-2">
            Your itinerary for{" "}
            <span className="text-white">
              {proposal.reservation?.destination}
            </span>{" "}
            has been confirmed and locked in.
          </p>
          <p className="text-stone-500 text-sm mb-8">
            {proposal.reservation?.villa} ·{" "}
            {formatDate(proposal.reservation?.arrivalDate || "")} –{" "}
            {formatDate(proposal.reservation?.departureDate || "")}
          </p>
          <Separator className="bg-stone-700 mb-8" />
          <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
            <p className="text-stone-400 text-sm mb-1">Total Confirmed</p>
            <p className="text-4xl font-light text-amber-400">
              $
              {(proposal.items || [])
                .reduce((sum, item) => sum + item.price, 0)
                .toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-stone-500 text-xs mt-2">
              {(proposal.items || []).length} curated experiences
            </p>
          </div>
          <p className="text-stone-600 text-xs mt-8">
            Your concierge team will have everything ready for your arrival.
          </p>
        </div>
      </div>
    );
  }

  const total = (proposal.items || []).reduce(
    (sum, item) => sum + item.price,
    0
  );
  const groupedItems = groupItemsByDate(proposal.items || []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-800 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Exclusive Resorts
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            Your Curated Itinerary
          </h1>
          <p className="text-stone-400 font-light text-lg mb-8">
            A bespoke experience crafted just for you
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-stone-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{proposal.reservation?.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-400" />
              <span>{proposal.reservation?.villa}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-stone-400">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              {formatDate(proposal.reservation?.arrivalDate || "")} –{" "}
              {formatDate(proposal.reservation?.departureDate || "")}
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {proposal.status !== "draft" && (
        <div
          className={`text-center py-3 text-sm font-medium ${
            proposal.status === "paid"
              ? "bg-amber-50 text-amber-800"
              : proposal.status === "approved"
              ? "bg-green-50 text-green-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {proposal.status === "paid" && "✓ Itinerary Confirmed & Locked In"}
          {proposal.status === "approved" && "✓ Itinerary Approved — Ready for Payment"}
          {proposal.status === "sent" && "Awaiting Your Approval"}
        </div>
      )}

      {/* Concierge Notes */}
      {proposal.notes && (
        <div className="max-w-3xl mx-auto px-6 mt-10">
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              A Note from Your Concierge
            </p>
            <p className="text-stone-700 font-light leading-relaxed italic">
              &ldquo;{proposal.notes}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Itinerary Items - Day by Day */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {Object.entries(groupedItems).map(([date, dayItems]) => (
          <div key={date} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-lg font-semibold text-stone-800">{date}</h3>
            </div>
            <div className="space-y-3 ml-5">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl mt-0.5">
                        {getCategoryIcon(item.category)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-stone-800">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatItemTime(item.scheduledAt)}</span>
                          <span>·</span>
                          <span>{item.category}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-stone-500 mt-2 font-light">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-stone-800 whitespace-nowrap ml-4">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Total */}
        <Separator className="mb-6" />
        <div className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Total Estimated Cost
          </p>
          <p className="text-4xl font-light text-stone-800">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-stone-400 text-sm mt-1">
            {(proposal.items || []).length} curated experience
            {(proposal.items || []).length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 text-center space-y-4">
          {proposal.status === "sent" && (
            <Button
              onClick={() => handleStatusUpdate("approved")}
              disabled={updating}
              className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Approve Itinerary
            </Button>
          )}

          {proposal.status === "approved" && (
            <Button
              onClick={() => handleStatusUpdate("paid")}
              disabled={updating}
              className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Pay & Lock In
            </Button>
          )}

          {proposal.status === "paid" && (
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-medium">
                Itinerary Confirmed — See You Soon!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-stone-400">
            Questions? Contact your concierge team directly.
          </p>
          <p className="text-xs text-stone-300 mt-1">
            © Exclusive Resorts
          </p>
        </div>
      </div>
    </div>
  );
}
