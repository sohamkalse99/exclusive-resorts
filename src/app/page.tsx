"use client";

import { useState, useEffect, useCallback } from "react";
import ReservationHeader from "@/components/concierge/ReservationHeader";
import CategoryCards from "@/components/concierge/CategoryCards";
import AddItemForm from "@/components/concierge/AddItemForm";
import LineItemsList from "@/components/concierge/LineItemsList";
import ProposalsList from "@/components/concierge/ProposalsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  LineItem,
  ReservationData,
  ProposalData,
} from "@/lib/constants";
import {
  Send,
  Eye,
  FilePlus,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";

export default function ConciergeDashboard() {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchReservation = useCallback(async () => {
    const res = await fetch("/api/reservations");
    const data = await res.json();
    if (data.length > 0) setReservation(data[0]);
  }, []);

  const fetchProposals = useCallback(async () => {
    const res = await fetch("/api/proposals");
    const data = await res.json();
    setProposals(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchReservation(), fetchProposals()]).finally(() =>
      setLoading(false)
    );
  }, [fetchReservation, fetchProposals]);

  const handleAddItem = (item: LineItem) => {
    setItems((prev) => [...prev, item]);
    setSelectedCategory(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateAndSend = async () => {
    if (!reservation || items.length === 0) return;
    setSaving(true);

    try {
      // Create the proposal
      const createRes = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          items,
          notes: notes || null,
        }),
      });
      const proposal = await createRes.json();

      // Send the proposal
      setSending(true);
      const sendRes = await fetch(`/api/proposals/${proposal.id}/send`, {
        method: "POST",
      });
      const sentData = await sendRes.json();

      console.log("📧 Proposal sent:", sentData);

      setItems([]);
      setNotes("");
      setSelectedCategory(null);
      setPreviewOpen(false);
      setSuccessMessage(
        `Proposal #${proposal.id} sent to ${reservation.memberEmail}!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);

      await fetchProposals();
    } catch (error) {
      console.error("Error creating/sending proposal:", error);
    } finally {
      setSaving(false);
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!reservation || items.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          items,
          notes: notes || null,
        }),
      });
      const proposal = await res.json();

      setItems([]);
      setNotes("");
      setSelectedCategory(null);
      setSuccessMessage(`Draft proposal #${proposal.id} saved!`);
      setTimeout(() => setSuccessMessage(null), 5000);

      await fetchProposals();
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Bar */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Exclusive Resorts
            </h1>
            <p className="text-xs text-muted-foreground">
              Concierge Dashboard
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto"
            >
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        {/* Reservation Header */}
        {reservation && <ReservationHeader reservation={reservation} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Build Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryCards
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
                {selectedCategory && reservation && (
                  <AddItemForm
                    category={selectedCategory}
                    arrivalDate={reservation.arrivalDate}
                    departureDate={reservation.departureDate}
                    onAdd={handleAddItem}
                    onCancel={() => setSelectedCategory(null)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Proposal Items ({items.length})
                  </CardTitle>
                  {items.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(!previewOpen)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {previewOpen ? "Close Preview" : "Preview"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <LineItemsList items={items} onRemove={handleRemoveItem} />
              </CardContent>
            </Card>

            {/* Preview Panel */}
            {previewOpen && items.length > 0 && (
              <Card className="border-2 border-slate-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    📋 Proposal Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-1">
                      Itinerary for {reservation?.memberName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {reservation?.villa}, {reservation?.destination}
                    </p>
                    <Separator className="my-4" />
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 text-sm">
                        <div>
                          <span className="font-medium">{item.title}</span>
                          <span className="text-muted-foreground ml-2">
                            ({item.category})
                          </span>
                        </div>
                        <span className="font-semibold">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>
                        $
                        {total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {notes && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Concierge Notes
                        </p>
                        <p className="text-sm">{notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Notes + Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="text-xs">
                    Message to Member (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a personal note for the member..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                {items.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Estimated Total
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleCreateAndSend}
                    disabled={items.length === 0 || saving}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {sending ? "Sending..." : "Create & Send Proposal"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveDraft}
                    disabled={items.length === 0 || saving}
                  >
                    {saving && !sending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FilePlus className="w-4 h-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proposals List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  All Proposals ({proposals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProposalsList proposals={proposals} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
