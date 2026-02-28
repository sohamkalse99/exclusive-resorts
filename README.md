# Exclusive Resorts — Concierge Itinerary Proposal System

A full-stack concierge tool for building, sending, and managing luxury trip itinerary proposals. The concierge creates a curated itinerary for a member, sends it via email (simulated), and the member reviews, approves, and pays to lock it in before their trip.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui** for components
- **SQLite** via **Drizzle ORM** + **better-sqlite3**
- **Lucide React** for icons

## Getting Started

```bash
# Install dependencies
npm install

# Seed the database
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the **Concierge Dashboard**.

## How It Works

### Concierge Dashboard (`/`)
- View the member's upcoming trip (destination, villa, dates)
- Build an itinerary by selecting from 6 categories: Dining, Activities, Wellness, Excursions, Transport, Experiences
- Add line items with title, description, date/time, and price
- Add optional notes/message for the member
- Preview the proposal before sending
- Save as draft or create & send in one click
- View all proposals and their current status

### Member Experience (`/proposal/[id]`)
- Luxury-styled itinerary view with day-by-day timeline
- Concierge notes displayed elegantly
- Total cost clearly presented
- **Approve** → moves proposal to `approved`
- **Pay & Lock In** → moves to `paid` with an animated confirmation screen

### API Routes
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/reservations` | Member's current reservation |
| POST | `/api/proposals` | Create a new proposal (draft) |
| GET | `/api/proposals` | List all proposals with status |
| GET | `/api/proposals/[id]` | Single proposal with line items |
| PATCH | `/api/proposals/[id]` | Update status (sent, approved, paid) |
| POST | `/api/proposals/[id]/send` | Mark as sent + log email |

### Database Schema
- **members** — id, name, email
- **reservations** — id, member_id, destination, villa, arrival/departure dates
- **proposals** — id, reservation_id, status, notes, created_at, sent_at
- **proposal_items** — id, proposal_id, category, title, description, scheduled_at, price
- **sent_emails** — id, proposal_id, to_email, sent_at, body_preview

## Assumptions

- **Single member/reservation**: The seed script creates one member (James Whitfield) with one reservation (Villa Punta Mita, Mar 15–22). The UI is designed around this scenario.
- **No real email**: Sending a proposal logs to `sent_emails` table and `console.log`. A success banner appears in the UI.
- **No real payment**: The "Pay & Lock In" button simply updates the status to `paid`.
- **Date handling**: Dates are stored as ISO strings in SQLite for simplicity.
- **SQLite file**: The database (`sqlite.db`) is created at the project root and is gitignored.

## Stretch Goals Implemented

- ✅ **Edit existing drafts**: Draft proposals can now be edited before sending. Click the "Edit" button on any draft proposal in the list.
- ✅ **Drag-and-drop reordering**: Itinerary items can be reordered by dragging the grip handle on the left of each item.
- ✅ **Mobile-responsive dashboard**: The concierge dashboard is now fully responsive with optimized layouts for mobile devices.
- ✅ **PDF export**: Once a proposal is paid, members can download a beautifully formatted PDF of their itinerary.

## What I Would Improve Given More Time

- **Authentication**: Add concierge login and member auth via magic links
- **Multiple members/reservations**: Support a dropdown to switch between members
- **Real email integration** (SendGrid, Resend, etc.)
- **Image uploads** for experiences (hero images per category)
- **E2E tests** with Playwright for the full create → send → approve → pay flow
- **Optimistic UI updates** with React Query or SWR for instant status changes
- **Rich text editor** for proposal notes with formatting options
- **Activity provider integration** for real-time pricing and availability
- **Multi-language support** for international members
- **Proposal templates** to quickly create common itinerary patterns

## What I Found Most Interesting

The dual UX challenge was the most compelling part — designing an efficient, no-nonsense dashboard for the concierge (who moves fast all day) versus a premium, luxury-feeling experience for the member (who should feel pampered just looking at it). The constraint of using only Tailwind made this an exercise in how much visual personality you can create with utility classes alone — the dark gradients, amber accents, and generous whitespace on the member side vs. the tight, card-based layout on the concierge side.

## Project Structure

```
src/
  app/
    page.tsx                         # Concierge Dashboard
    proposal/[id]/page.tsx           # Member Proposal View
    api/
      reservations/route.ts          # GET reservations
      proposals/route.ts             # GET/POST proposals
      proposals/[id]/route.ts        # GET/PATCH single proposal
      proposals/[id]/send/route.ts   # POST send proposal
  components/
    concierge/                       # Dashboard components
    ui/                              # shadcn/ui components
  db/
    schema.ts                        # Drizzle ORM schema
    index.ts                         # Database connection
    seed.ts                          # Seed script
  lib/
    constants.ts                     # Types and category data
    utils.ts                         # Utility functions
```
