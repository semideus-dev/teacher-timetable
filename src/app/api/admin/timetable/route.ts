import { db } from "@/lib/db";
import { timetableEntry, subject } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      programId,
      subjectName,
      subjectCode,
      teacherId,
      roomId,
      lectureSlot,
      dayRange,
    } = body;

    if (!programId || !lectureSlot) {
      return NextResponse.json(
        { error: "Program ID and lecture slot are required" },
        { status: 400 }
      );
    }

    let subjectId = null;

    // Create or find subject if provided
    if (subjectName && subjectCode) {
      const [existingSubject] = await db
        .select()
        .from(subject)
        .where(eq(subject.code, subjectCode))
        .limit(1);

      if (existingSubject) {
        subjectId = existingSubject.id;
      } else {
        const [newSubject] = await db
          .insert(subject)
          .values({ name: subjectName, code: subjectCode })
          .returning();
        subjectId = newSubject.id;
      }
    }

    const [entry] = await db
      .insert(timetableEntry)
      .values({
        programId,
        subjectId,
        teacherId: teacherId || null,
        roomId: roomId || null,
        lectureSlot,
        dayRange: dayRange || null,
      })
      .returning();

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, subjectName, subjectCode, teacherId, roomId, dayRange } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    let subjectId = null;

    // Create or find subject if provided
    if (subjectName && subjectCode) {
      const [existingSubject] = await db
        .select()
        .from(subject)
        .where(eq(subject.code, subjectCode))
        .limit(1);

      if (existingSubject) {
        // Update existing subject name if it changed
        if (existingSubject.name !== subjectName) {
          await db
            .update(subject)
            .set({ name: subjectName, updatedAt: new Date() })
            .where(eq(subject.id, existingSubject.id));
        }
        subjectId = existingSubject.id;
      } else {
        const [newSubject] = await db
          .insert(subject)
          .values({ name: subjectName, code: subjectCode })
          .returning();
        subjectId = newSubject.id;
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (subjectId !== null) {
      updateData.subjectId = subjectId;
    }
    if (teacherId !== undefined) {
      updateData.teacherId = teacherId || null;
    }
    if (roomId !== undefined) {
      updateData.roomId = roomId || null;
    }
    if (dayRange !== undefined) {
      updateData.dayRange = dayRange || null;
    }

    const [updatedEntry] = await db
      .update(timetableEntry)
      .set(updateData)
      .where(eq(timetableEntry.id, id))
      .returning();

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { error: "Failed to update timetable entry" },
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
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    await db.delete(timetableEntry).where(eq(timetableEntry.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 }
    );
  }
}
