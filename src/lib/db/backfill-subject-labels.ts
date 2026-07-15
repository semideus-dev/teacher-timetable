import "dotenv/config";
import type { SQL } from "drizzle-orm";
import { and, eq, isNull } from "drizzle-orm";
import inputData from "../../../output.json";
import { db } from "./index";
import { program, room, subject, teacher, timetableEntry } from "./schema";

interface OtherUniqueRow {
  feild_name: string;
  [key: string]: string | undefined;
}

interface ProgramData {
  program_name: string;
  other_unique_rows: OtherUniqueRow[];
}

interface SourceEntry {
  programName: string;
  lectureSlot: string;
  subjectCode: string | null;
  subjectLabel: string | null;
  teacherName: string | null;
  roomName: string | null;
  dayRange: string | null;
}

const lectureSlots = [
  "lect-1_(9:00-9:45)",
  "lect-2_(9:45-10:30)",
  "lect-3_(10:30-11:15)",
  "lect-4_(11:15-12:00)",
  "lect-5_(12:00-12:45)",
  "lect-6_(12:45-1:30)",
  "lect-7_(1:30-2:15)",
  "lect-8_(2:15-3:00)",
] as const;

function splitValues(value: string | undefined): Array<string | null> {
  const values = value?.split("/").map((item) => item.trim()) ?? [];
  return values.length > 0 ? values : [null];
}

function valueAt(values: Array<string | null>, index: number): string | null {
  return values[index] || values[0] || null;
}

function buildSourceEntries(): SourceEntry[] {
  const programs: ProgramData[] = inputData.programs;
  const sourceEntries: SourceEntry[] = [];

  for (const prog of programs) {
    const subjectRows = prog.other_unique_rows.filter(
      (row) => row.feild_name === "subject",
    );
    const codeRows = prog.other_unique_rows.filter(
      (row) => row.feild_name === "Code",
    );
    const teacherRows = prog.other_unique_rows.filter(
      (row) => row.feild_name === "Teacher",
    );
    const roomRows = prog.other_unique_rows.filter(
      (row) => row.feild_name === "Room",
    );
    const dayRows = prog.other_unique_rows.filter(
      (row) => row.feild_name === "Day",
    );

    const maxSets = Math.max(
      subjectRows.length,
      codeRows.length,
      teacherRows.length,
      roomRows.length,
      dayRows.length,
    );

    for (let setIndex = 0; setIndex < maxSets; setIndex++) {
      const subjectRow = subjectRows[setIndex];
      const codeRow = codeRows[setIndex];
      const teacherRow = teacherRows[setIndex];
      const roomRow = roomRows[setIndex];
      const dayRow = dayRows[setIndex];

      if (!subjectRow || !codeRow) continue;

      for (const lectureSlot of lectureSlots) {
        const subjectName = subjectRow[lectureSlot];
        const subjectCode = codeRow[lectureSlot];
        if (!subjectName && !subjectCode) continue;

        const subjectNames = splitValues(subjectName);
        const subjectCodes = splitValues(subjectCode);
        const teacherNames = splitValues(teacherRow?.[lectureSlot]);
        const roomNames = splitValues(roomRow?.[lectureSlot]);
        const dayRanges = splitValues(dayRow?.[lectureSlot]);
        const maxLength = Math.max(
          subjectCodes.length,
          teacherNames.length,
          roomNames.length,
          dayRanges.length,
        );

        for (let index = 0; index < maxLength; index++) {
          const teacherName = valueAt(teacherNames, index);

          sourceEntries.push({
            programName: prog.program_name,
            lectureSlot,
            subjectCode: valueAt(subjectCodes, index),
            subjectLabel: valueAt(subjectNames, index),
            teacherName:
              teacherName && !teacherName.startsWith("NEW")
                ? teacherName
                : null,
            roomName: valueAt(roomNames, index),
            dayRange: valueAt(dayRanges, index),
          });
        }
      }
    }
  }

  return sourceEntries;
}

async function main() {
  const [programRows, subjectRows, teacherRows, roomRows] = await Promise.all([
    db.select({ id: program.id, name: program.name }).from(program),
    db.select({ id: subject.id, code: subject.code }).from(subject),
    db.select({ id: teacher.id, name: teacher.name }).from(teacher),
    db.select({ id: room.id, name: room.name }).from(room),
  ]);

  const programIds = new Map(programRows.map((item) => [item.name, item.id]));
  const subjectIds = new Map(subjectRows.map((item) => [item.code, item.id]));
  const teacherIds = new Map(teacherRows.map((item) => [item.name, item.id]));
  const roomIds = new Map(roomRows.map((item) => [item.name, item.id]));

  let updatedCount = 0;
  let skippedCount = 0;

  for (const sourceEntry of buildSourceEntries()) {
    const programId = programIds.get(sourceEntry.programName);
    if (!programId || !sourceEntry.subjectLabel) {
      skippedCount++;
      continue;
    }

    const subjectId = sourceEntry.subjectCode
      ? subjectIds.get(sourceEntry.subjectCode)
      : undefined;
    const teacherId = sourceEntry.teacherName
      ? teacherIds.get(sourceEntry.teacherName)
      : undefined;
    const roomId = sourceEntry.roomName
      ? roomIds.get(sourceEntry.roomName)
      : undefined;

    const conditions: SQL[] = [
      eq(timetableEntry.programId, programId),
      eq(timetableEntry.lectureSlot, sourceEntry.lectureSlot),
    ];

    conditions.push(
      subjectId
        ? eq(timetableEntry.subjectId, subjectId)
        : isNull(timetableEntry.subjectId),
    );
    conditions.push(
      teacherId
        ? eq(timetableEntry.teacherId, teacherId)
        : isNull(timetableEntry.teacherId),
    );
    conditions.push(
      roomId
        ? eq(timetableEntry.roomId, roomId)
        : isNull(timetableEntry.roomId),
    );
    conditions.push(
      sourceEntry.dayRange
        ? eq(timetableEntry.dayRange, sourceEntry.dayRange)
        : isNull(timetableEntry.dayRange),
    );

    const updatedRows = await db
      .update(timetableEntry)
      .set({
        subjectLabel: sourceEntry.subjectLabel,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning({ id: timetableEntry.id });

    if (updatedRows.length === 0) {
      skippedCount++;
    } else {
      updatedCount += updatedRows.length;
    }
  }

  console.log(
    `Subject label backfill complete. Updated ${updatedCount} rows; skipped ${skippedCount}.`,
  );
}

main().catch((error) => {
  console.error("Subject label backfill failed:", error);
  process.exitCode = 1;
});
