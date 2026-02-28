import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems, reservations, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

    return NextResponse.json({
      ...proposal,
      items,
      reservation,
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposalId = parseInt(id);

    if (isNaN(proposalId)) {
      return NextResponse.json({ error: "Invalid proposal ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    const validStatuses = ["draft", "sent", "approved", "paid"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | null> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const [updated] = await db
      .update(proposals)
      .set(updateData)
      .where(eq(proposals.id, proposalId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}
