import { db } from "@/lib/db";
import { room } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const [newRoom] = await db
      .insert(room)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json(newRoom);
  } catch (error: any) {
    if (error?.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    await db.delete(room).where(eq(room.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
