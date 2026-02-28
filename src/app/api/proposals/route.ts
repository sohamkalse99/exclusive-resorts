import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select()
      .from(proposals)
      .orderBy(desc(proposals.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId, items, notes } = body;

    if (!reservationId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "reservationId and at least one item are required" },
        { status: 400 }
      );
    }

    const [proposal] = await db
      .insert(proposals)
      .values({
        reservationId,
        status: "draft",
        notes: notes || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const insertedItems = await db
      .insert(proposalItems)
      .values(
        items.map(
          (item: {
            category: string;
            title: string;
            description?: string;
            scheduledAt: string;
            price: number;
          }) => ({
            proposalId: proposal.id,
            category: item.category,
            title: item.title,
            description: item.description || null,
            scheduledAt: item.scheduledAt,
            price: item.price,
          })
        )
      )
      .returning();

    return NextResponse.json(
      { ...proposal, items: insertedItems },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
