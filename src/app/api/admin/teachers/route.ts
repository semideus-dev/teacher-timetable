import { db } from "@/lib/db";
import { teacher } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Teacher name is required" },
        { status: 400 }
      );
    }

    const [newTeacher] = await db
      .insert(teacher)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json(newTeacher);
  } catch (error: any) {
    if (error?.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Teacher already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create teacher" },
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
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    await db.delete(teacher).where(eq(teacher.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
