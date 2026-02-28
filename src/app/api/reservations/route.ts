import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select({
        id: reservations.id,
        memberId: reservations.memberId,
        destination: reservations.destination,
        villa: reservations.villa,
        arrivalDate: reservations.arrivalDate,
        departureDate: reservations.departureDate,
        memberName: members.name,
        memberEmail: members.email,
      })
      .from(reservations)
      .innerJoin(members, eq(reservations.memberId, members.id));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
