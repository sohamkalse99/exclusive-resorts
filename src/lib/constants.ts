export const CATEGORIES = [
  {
    name: "Dining",
    icon: "🍽️",
    examples: "Private chef dinner, restaurant reservation",
  },
  {
    name: "Activities",
    icon: "🏄",
    examples: "Surf lesson, snorkeling, ATV tour",
  },
  {
    name: "Wellness",
    icon: "💆",
    examples: "Spa treatment, yoga session, massage",
  },
  {
    name: "Excursions",
    icon: "⛵",
    examples: "Whale watching, sailing charter, cultural tour",
  },
  {
    name: "Transport",
    icon: "🚗",
    examples: "Airport transfer, private car, helicopter",
  },
  {
    name: "Experiences",
    icon: "🌅",
    examples: "Sunset cocktails, bonfire on the beach, tequila tasting",
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

export interface LineItem {
  category: string;
  title: string;
  description: string;
  scheduledAt: string;
  price: number;
}

export interface ReservationData {
  id: number;
  memberId: number;
  destination: string;
  villa: string;
  arrivalDate: string;
  departureDate: string;
  memberName: string;
  memberEmail: string;
}

export interface ProposalData {
  id: number;
  reservationId: number;
  status: "draft" | "sent" | "approved" | "paid";
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
  items?: ProposalItemData[];
  reservation?: ReservationData;
}

export interface ProposalItemData {
  id: number;
  proposalId: number;
  category: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  price: number;
}
