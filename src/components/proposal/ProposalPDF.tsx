"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { ProposalData } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #1e293b",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    fontSize: 12,
  },
  infoLabel: {
    width: 100,
    color: "#64748b",
    fontWeight: "bold",
  },
  infoValue: {
    color: "#1e293b",
  },
  dayGroup: {
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1px solid #e2e8f0",
  },
  itemContainer: {
    backgroundColor: "#f8fafc",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeft: "3px solid #f59e0b",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  itemDetails: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 3,
  },
  notesSection: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 11,
    color: "#475569",
    fontStyle: "italic",
  },
  totalSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: "2px solid #1e293b",
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#94a3b8",
  },
});

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatItemTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupItemsByDate(items: any[]) {
  const groups: Record<string, any[]> = {};
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

// PDF Document Component
const ProposalDocument = ({ proposal }: { proposal: ProposalData }) => {
  const total = (proposal.items || []).reduce(
    (sum, item) => sum + item.price,
    0
  );
  const groupedItems = groupItemsByDate(proposal.items || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>EXCLUSIVE RESORTS</Text>
          <Text style={styles.title}>Your Curated Itinerary</Text>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guest:</Text>
            <Text style={styles.infoValue}>
              {proposal.reservation?.memberName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>
              {proposal.reservation?.destination}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Villa:</Text>
            <Text style={styles.infoValue}>{proposal.reservation?.villa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dates:</Text>
            <Text style={styles.infoValue}>
              {formatDate(proposal.reservation?.arrivalDate || "")} -{" "}
              {formatDate(proposal.reservation?.departureDate || "")}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {proposal.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>From Your Concierge</Text>
            <Text style={styles.notesText}>{proposal.notes}</Text>
          </View>
        )}

        {/* Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {Object.entries(groupedItems).map(([date, items], dayIndex) => (
            <View key={dayIndex} style={styles.dayGroup}>
              <Text style={styles.dayHeader}>{date}</Text>
              {items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ${item.price.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.itemDetails}>
                    {item.category} • {formatItemTime(item.scheduledAt)}
                  </Text>
                  {item.description && (
                    <Text style={styles.itemDetails}>{item.description}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Estimated Cost</Text>
          <Text style={styles.totalAmount}>
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.itemDetails}>
            {(proposal.items || []).length} curated experience
            {(proposal.items || []).length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © Exclusive Resorts • Proposal #{proposal.id} •{" "}
          {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

// Export Button Component
export default function ProposalPDFExport({
  proposal,
}: {
  proposal: ProposalData;
}) {
  if (!proposal || !proposal.items) return null;

  const fileName = `exclusive-resorts-proposal-${proposal.id}-${proposal.reservation?.memberName?.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return (
    <PDFDownloadLink
      document={<ProposalDocument proposal={proposal} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
