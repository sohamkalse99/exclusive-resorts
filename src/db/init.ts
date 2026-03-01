import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create tables if they don't exist
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

// Only seed if the database is empty
const memberCount = (sqlite.prepare("SELECT COUNT(*) as count FROM members").get() as { count: number }).count;

if (memberCount === 0) {
  const insertMember = sqlite.prepare("INSERT INTO members (name, email) VALUES (?, ?)");
  const insertReservation = sqlite.prepare(
    "INSERT INTO reservations (member_id, destination, villa, arrival_date, departure_date) VALUES (?, ?, ?, ?, ?)"
  );

  const member1 = insertMember.run("James Whitfield", "james.whitfield@example.com");
  const member2 = insertMember.run("Sarah Chen", "sarah.chen@example.com");
  const member3 = insertMember.run("Robert Johnson", "robert.johnson@example.com");

  insertReservation.run(member1.lastInsertRowid, "Mexico", "Villa Punta Mita", "2025-03-15", "2025-03-22");
  insertReservation.run(member2.lastInsertRowid, "Italy", "Villa Tuscany", "2025-04-10", "2025-04-17");
  insertReservation.run(member3.lastInsertRowid, "Caribbean", "Villa St. Barts", "2025-05-20", "2025-05-27");

  console.log("✅ Database seeded successfully!");
} else {
  console.log(`✅ Database already initialized (${memberCount} members found), skipping seed.`);
}

sqlite.close();
