import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id),
  destination: text("destination").notNull(),
  villa: text("villa").notNull(),
  arrivalDate: text("arrival_date").notNull(),
  departureDate: text("departure_date").notNull(),
});

export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reservationId: integer("reservation_id")
    .notNull()
    .references(() => reservations.id),
  status: text("status", {
    enum: ["draft", "sent", "approved", "paid"],
  })
    .notNull()
    .default("draft"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  sentAt: text("sent_at"),
});

export const proposalItems = sqliteTable("proposal_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id")
    .notNull()
    .references(() => proposals.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: text("scheduled_at").notNull(),
  price: real("price").notNull(),
});

export const sentEmails = sqliteTable("sent_emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id")
    .notNull()
    .references(() => proposals.id),
  toEmail: text("to_email").notNull(),
  sentAt: text("sent_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  bodyPreview: text("body_preview"),
});

export type Member = typeof members.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type ProposalItem = typeof proposalItems.$inferSelect;
export type SentEmail = typeof sentEmails.$inferSelect;
