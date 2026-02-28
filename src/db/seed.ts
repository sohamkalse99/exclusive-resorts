import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    destination TEXT NOT NULL,
    villa TEXT NOT NULL,
    arrival_date TEXT NOT NULL,
    departure_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id),
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TEXT NOT NULL,
    sent_at TEXT
  );

  CREATE TABLE IF NOT EXISTS proposal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TEXT NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sent_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id),
    to_email TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    body_preview TEXT
  );
`);

// Clear existing data and reset auto-increment
sqlite.exec(`
  DELETE FROM sent_emails;
  DELETE FROM proposal_items;
  DELETE FROM proposals;
  DELETE FROM reservations;
  DELETE FROM members;
  DELETE FROM sqlite_sequence;
`);

// Seed member
const insertMember = sqlite.prepare(
  "INSERT INTO members (name, email) VALUES (?, ?)"
);
const memberResult = insertMember.run("James Whitfield", "james.whitfield@example.com");
const memberId = memberResult.lastInsertRowid;

// Seed reservation
const insertReservation = sqlite.prepare(
  "INSERT INTO reservations (member_id, destination, villa, arrival_date, departure_date) VALUES (?, ?, ?, ?, ?)"
);
insertReservation.run(
  memberId,
  "Punta Mita, Mexico",
  "Villa Punta Mita",
  "2025-03-15",
  "2025-03-22"
);

console.log("✅ Database seeded successfully!");
console.log(`   Member: James Whitfield (ID: ${memberId})`);
console.log("   Reservation: Villa Punta Mita, Mexico — Mar 15–22, 2025");

sqlite.close();
