import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems, reservations, members, sentEmails } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposalId = parseInt(id);

    if (isNaN(proposalId)) {
      return NextResponse.json({ error: "Invalid proposal ID" }, { status: 400 });
    }

    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId));

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft proposals can be sent" },
        { status: 400 }
      );
    }

    const items = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposalId));

    const [reservation] = await db
      .select({
        id: reservations.id,
        destination: reservations.destination,
        villa: reservations.villa,
        arrivalDate: reservations.arrivalDate,
        departureDate: reservations.departureDate,
        memberName: members.name,
        memberEmail: members.email,
      })
      .from(reservations)
      .innerJoin(members, eq(reservations.memberId, members.id))
      .where(eq(reservations.id, proposal.reservationId));

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found for this proposal" },
        { status: 404 }
      );
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const sentAt = new Date().toISOString();

    const bodyPreview = `Dear ${reservation.memberName},\n\nYour curated itinerary for ${reservation.destination} (${reservation.villa}) is ready for your review.\n\n${items.length} experiences totaling $${totalPrice.toLocaleString()}\n\nView your proposal: /proposal/${proposalId}\n\nWith warm regards,\nExclusive Resorts Concierge Team`;

    // Update proposal status
    const [updated] = await db
      .update(proposals)
      .set({ status: "sent", sentAt })
      .where(eq(proposals.id, proposalId))
      .returning();

    // Log the email
    const [email] = await db
      .insert(sentEmails)
      .values({
        proposalId,
        toEmail: reservation.memberEmail,
        sentAt,
        bodyPreview,
      })
      .returning();

    console.log("📧 Email sent to:", reservation.memberEmail);
    console.log("📧 Subject: Your Exclusive Resorts Itinerary Proposal");
    console.log("📧 Body Preview:", bodyPreview);

    return NextResponse.json({
      ...updated,
      email,
      message: `Proposal sent to ${reservation.memberEmail}`,
    });
  } catch (error) {
    console.error("Error sending proposal:", error);
    return NextResponse.json(
      { error: "Failed to send proposal" },
      { status: 500 }
    );
  }
}
