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

## Demo Video Link
Unfortunately, Loom only allows you to create 5 minutes videos for free, so I recorded it on zoom and then uploaded it to YouTube.

https://youtu.be/ttbHp-6Wbos

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

- **Multiple members/reservations**: The seed script creates three members (James Whitfield, Sarah Chen, Robert Johnson) with one reservation each. The dashboard defaults to James Whitfield's reservation (Villa Punta Mita, Mar 15–22).
- **No real email**: Sending a proposal logs to `sent_emails` table and `console.log`. A success banner appears in the UI.
- **No real payment**: The "Pay & Lock In" button simply updates the status to `paid`.
- **Date handling**: Dates are stored as ISO strings in SQLite for simplicity.
- **SQLite file**: The database (`sqlite.db`) is created at the project root and is gitignored.

## Stretch Goals Implemented

- ✅ **Edit existing drafts**: Draft proposals can now be edited before sending. Click the "Edit" button on any draft proposal in the list.
- ✅ **Drag-and-drop reordering**: Itinerary items can be reordered by dragging the grip handle on the left of each item.
- ✅ **Mobile-responsive dashboard**: The concierge dashboard is now fully responsive with optimized layouts for mobile devices.
- ✅ **PDF export**: Once a proposal is paid, members can download a beautifully formatted PDF of their itinerary.
- ✅ **Timeline view**: The member view displays a beautiful day-by-day timeline of the itinerary.
- ✅ **Multiple members/reservations**: Support for multiple members with a dropdown selector in the concierge dashboard.
- ✅ **Optimistic UI updates**: Status changes and proposal creation feel instant with immediate UI updates while API calls happen in the background.

## What I Would Improve Given More Time

1. Authentication  
   - Two different login/registration pages for concierge and our members
   - Use JWT/Okta auth
2. For production deployment
   - PostgreSQL
   - CI/CD pipelineing
3. Integration Tests
4. Real Email Integration
   - SendGrid
5. Real Payment Integration
   - Stripe

## What I Found Most Interesting

The dual UX challenge was the most compelling part — designing an efficient, dashboard for the concierge (who moves fast all day) versus a premium, luxury-feeling experience for the member. The constraint of using only Tailwind made this an exercise in how much visual personality you can create with utility classes alone — the dark gradients, amber accents on the member side vs. the tight, card-based layout on the concierge side.

Using SQLite along with Drizzle ORM was a great choice for this project — it's simple to set up and perfect for local development, making it easy to get started quickly.

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
### API Results

GET: http://localhost:3000/api/reservations/

```
[
    {
        "id": 1,
        "memberId": 1,
        "destination": "Mexico",
        "villa": "Villa Punta Mita",
        "arrivalDate": "2025-03-15",
        "departureDate": "2025-03-22",
        "memberName": "James Whitfield",
        "memberEmail": "james.whitfield@example.com"
    },
    {
        "id": 2,
        "memberId": 2,
        "destination": "Italy",
        "villa": "Villa Tuscany",
        "arrivalDate": "2025-04-10",
        "departureDate": "2025-04-17",
        "memberName": "Sarah Chen",
        "memberEmail": "sarah.chen@example.com"
    },
    {
        "id": 3,
        "memberId": 3,
        "destination": "Caribbean",
        "villa": "Villa St. Barts",
        "arrivalDate": "2025-05-20",
        "departureDate": "2025-05-27",
        "memberName": "Robert Johnson",
        "memberEmail": "robert.johnson@example.com"
    }
]
```

GET: http://localhost:3000/api/proposals
```
[
    {
        "id": 6,
        "reservationId": 1,
        "status": "sent",
        "notes": "Welcome package for James Whitfield",
        "createdAt": "2026-03-01T19:04:05.091Z",
        "sentAt": "2026-03-01T19:04:12.522Z"
    },
    {
        "id": 5,
        "reservationId": 1,
        "status": "paid",
        "notes": "Updated itinerary per client feedback",
        "createdAt": "2026-03-01T18:53:43.572Z",
        "sentAt": null
    },
    {
        "id": 4,
        "reservationId": 2,
        "status": "paid",
        "notes": "Sunset Cocktails and Private Car",
        "createdAt": "2026-02-28T23:29:07.720Z",
        "sentAt": "2026-02-28T23:29:21.376Z"
    },
    {
        "id": 3,
        "reservationId": 1,
        "status": "paid",
        "notes": "Yoga and Cultural Tour",
        "createdAt": "2026-02-28T22:57:57.300Z",
        "sentAt": "2026-02-28T22:57:57.313Z"
    },
    {
        "id": 2,
        "reservationId": 1,
        "status": "paid",
        "notes": "Surf Activity",
        "createdAt": "2026-02-28T22:55:30.853Z",
        "sentAt": "2026-02-28T22:55:34.769Z"
    },
    {
        "id": 1,
        "reservationId": 1,
        "status": "paid",
        "notes": "Premium Restaurant Booked on 1st day",
        "createdAt": "2026-02-28T22:54:11.990Z",
        "sentAt": "2026-02-28T22:54:19.752Z"
    }
]
```
GET: http://localhost:3000/api/proposals/4
```
{
    "id": 4,
    "reservationId": 2,
    "status": "paid",
    "notes": "Sunset Cocktails and Private Car",
    "createdAt": "2026-02-28T23:29:07.720Z",
    "sentAt": "2026-02-28T23:29:21.376Z",
    "items": [
        {
            "id": 9,
            "proposalId": 4,
            "category": "Experiences",
            "title": "Sunset Cocktails",
            "description": null,
            "scheduledAt": "2025-04-10T16:27",
            "price": 170
        },
        {
            "id": 10,
            "proposalId": 4,
            "category": "Transport",
            "title": "Private Car",
            "description": null,
            "scheduledAt": "2025-04-11T18:30",
            "price": 300
        }
    ],
    "reservation": {
        "id": 2,
        "destination": "Italy",
        "villa": "Villa Tuscany",
        "arrivalDate": "2025-04-10",
        "departureDate": "2025-04-17",
        "memberName": "Sarah Chen",
        "memberEmail": "sarah.chen@example.com"
    }
}
```

POST: http://localhost:3000/api/proposals
```
Body:

{
   "reservationId": 1,
   "notes": "Welcome package for James Whitfield",
   "items": [
     {
       "category": "Dining",
       "title": "Private Chef Dinner",
       "description": "5-course tasting menu with wine pairing",
       "scheduledAt": "2025-03-18T19:00:00Z",
       "price": 850
     },
     {
       "category": "Activities",
       "title": "Surfing Lesson",
       "description": "2-hour private lesson at the beach",
       "scheduledAt": "2025-03-16T10:00:00Z",
       "price": 250
     },
     {
       "category": "Wellness",
       "title": "Couples Spa Treatment",
       "scheduledAt": "2025-03-17T14:00:00Z",
       "price": 400
     }
   ]
 }

 Response:
 {
    "id": 5,
    "reservationId": 1,
    "status": "draft",
    "notes": "Welcome package for James Whitfield",
    "createdAt": "2026-03-01T18:53:43.572Z",
    "sentAt": null,
    "items": [
        {
            "id": 11,
            "proposalId": 5,
            "category": "Dining",
            "title": "Private Chef Dinner",
            "description": "5-course tasting menu with wine pairing",
            "scheduledAt": "2025-03-18T19:00:00Z",
            "price": 850
        },
        {
            "id": 12,
            "proposalId": 5,
            "category": "Activities",
            "title": "Surfing Lesson",
            "description": "2-hour private lesson at the beach",
            "scheduledAt": "2025-03-16T10:00:00Z",
            "price": 250
        },
        {
            "id": 13,
            "proposalId": 5,
            "category": "Wellness",
            "title": "Couples Spa Treatment",
            "description": null,
            "scheduledAt": "2025-03-17T14:00:00Z",
            "price": 400
        }
    ]
}
```

PATCH: http://localhost:3000/api/proposals/5
```
Body: 

{
   "notes": "Updated itinerary per client feedback",
   "items": [
     {
       "category": "Dining",
       "title": "Beachside Dinner",
       "description": "Romantic sunset dinner on the beach",
       "scheduledAt": "2025-03-18T18:30:00Z",
       "price": 650
     },
     {
       "category": "Excursions",
       "title": "Whale Watching Tour",
       "scheduledAt": "2025-03-19T08:00:00Z",
       "price": 300
     }
   ]
 }

 Response:

 {
    "id": 5,
    "reservationId": 1,
    "status": "draft",
    "notes": "Updated itinerary per client feedback",
    "createdAt": "2026-03-01T18:53:43.572Z",
    "sentAt": null
}

PATCH: http://localhost:3000/api/proposals/5

Body: {
   "status": "approved"
}

Response: {
    "id": 5,
    "reservationId": 1,
    "status": "approved",
    "notes": "Updated itinerary per client feedback",
    "createdAt": "2026-03-01T18:53:43.572Z",
    "sentAt": null
}

PATCH: http://localhost:3000/api/proposals/5

Body:{
   "status": "paid"
}

Response: {
    "id": 5,
    "reservationId": 1,
    "status": "paid",
    "notes": "Updated itinerary per client feedback",
    "createdAt": "2026-03-01T18:53:43.572Z",
    "sentAt": null
}
 ```
POST: http://localhost:3000/api/proposals/6/send

```
Body: {}

Response : {
    "id": 6,
    "reservationId": 1,
    "status": "sent",
    "notes": "Welcome package for James Whitfield",
    "createdAt": "2026-03-01T19:04:05.091Z",
    "sentAt": "2026-03-01T19:04:12.522Z",
    "email": {
        "id": 5,
        "proposalId": 6,
        "toEmail": "james.whitfield@example.com",
        "sentAt": "2026-03-01T19:04:12.522Z",
        "bodyPreview": "Dear James Whitfield,\n\nYour curated itinerary for Mexico (Villa Punta Mita) is ready for your review.\n\n3 experiences totaling $1,500\n\nView your proposal: /proposal/6\n\nWith warm regards,\nExclusive Resorts Concierge Team"
    },
    "message": "Proposal sent to james.whitfield@example.com"
}
```
