import { db } from "@/lib/db";
import { program } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Program name is required" },
        { status: 400 }
      );
    }

    const [newProgram] = await db
      .insert(program)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json(newProgram);
  } catch (error: any) {
    if (error?.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Program already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create program" },
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
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    await db.delete(program).where(eq(program.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
