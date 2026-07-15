import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subject, timetableEntry } from "@/lib/db/schema";
import { getDisplaySubjectName } from "@/modules/timetable/utils/group-schedule";

type TimetableEntryUpdate = Partial<typeof timetableEntry.$inferInsert> & {
  updatedAt: Date;
};

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
        { status: 400 },
      );
    }

    let subjectId = null;
    const subjectLabel =
      typeof subjectName === "string" && subjectName.trim()
        ? subjectName.trim()
        : null;

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
          .values({
            name: getDisplaySubjectName(subjectName) || subjectName,
            code: subjectCode,
          })
          .returning();
        subjectId = newSubject.id;
      }
    }

    const [entry] = await db
      .insert(timetableEntry)
      .values({
        programId,
        subjectId,
        subjectLabel,
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
      { status: 500 },
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
        { status: 400 },
      );
    }

    let subjectId = null;
    const subjectLabel =
      typeof subjectName === "string" && subjectName.trim()
        ? subjectName.trim()
        : null;

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
          .values({
            name: getDisplaySubjectName(subjectName) || subjectName,
            code: subjectCode,
          })
          .returning();
        subjectId = newSubject.id;
      }
    }

    const updateData: TimetableEntryUpdate = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (subjectId !== null) {
      updateData.subjectId = subjectId;
    }
    if (subjectName !== undefined) {
      updateData.subjectLabel = subjectLabel;
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
      { status: 500 },
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
        { status: 400 },
      );
    }

    await db.delete(timetableEntry).where(eq(timetableEntry.id, id));

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 },
    );
  }
}
