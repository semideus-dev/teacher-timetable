import { db } from "@/lib/db";
import {
  program,
  teacher,
  room,
  subject,
  timetableEntry,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAllPrograms() {
  return await db.select().from(program).orderBy(program.name);
}

export async function getAllTeachers() {
  return await db.select().from(teacher).orderBy(teacher.name);
}

export async function getAllRooms() {
  return await db.select().from(room).orderBy(room.name);
}

export async function getAllSubjects() {
  return await db.select().from(subject).orderBy(subject.code);
}

export async function getTimetableEntries() {
  return await db
    .select({
      id: timetableEntry.id,
      lectureSlot: timetableEntry.lectureSlot,
      dayRange: timetableEntry.dayRange,
      program: {
        id: program.id,
        name: program.name,
      },
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      teacher: {
        id: teacher.id,
        name: teacher.name,
      },
      room: {
        id: room.id,
        name: room.name,
      },
    })
    .from(timetableEntry)
    .leftJoin(program, eq(timetableEntry.programId, program.id))
    .leftJoin(subject, eq(timetableEntry.subjectId, subject.id))
    .leftJoin(teacher, eq(timetableEntry.teacherId, teacher.id))
    .leftJoin(room, eq(timetableEntry.roomId, room.id));
}

export async function getTimetableByProgram(programId: string) {
  return await db
    .select({
      id: timetableEntry.id,
      lectureSlot: timetableEntry.lectureSlot,
      dayRange: timetableEntry.dayRange,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      teacher: {
        id: teacher.id,
        name: teacher.name,
      },
      room: {
        id: room.id,
        name: room.name,
      },
    })
    .from(timetableEntry)
    .where(eq(timetableEntry.programId, programId))
    .leftJoin(subject, eq(timetableEntry.subjectId, subject.id))
    .leftJoin(teacher, eq(timetableEntry.teacherId, teacher.id))
    .leftJoin(room, eq(timetableEntry.roomId, room.id));
}

export async function getTimetableByTeacher(teacherId: string) {
  return await db
    .select({
      id: timetableEntry.id,
      lectureSlot: timetableEntry.lectureSlot,
      dayRange: timetableEntry.dayRange,
      program: {
        id: program.id,
        name: program.name,
      },
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      room: {
        id: room.id,
        name: room.name,
      },
    })
    .from(timetableEntry)
    .where(eq(timetableEntry.teacherId, teacherId))
    .leftJoin(program, eq(timetableEntry.programId, program.id))
    .leftJoin(subject, eq(timetableEntry.subjectId, subject.id))
    .leftJoin(room, eq(timetableEntry.roomId, room.id));
}

export async function getTimetableByRoom(roomId: string) {
  return await db
    .select({
      id: timetableEntry.id,
      lectureSlot: timetableEntry.lectureSlot,
      dayRange: timetableEntry.dayRange,
      program: {
        id: program.id,
        name: program.name,
      },
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
      },
      teacher: {
        id: teacher.id,
        name: teacher.name,
      },
    })
    .from(timetableEntry)
    .where(eq(timetableEntry.roomId, roomId))
    .leftJoin(program, eq(timetableEntry.programId, program.id))
    .leftJoin(subject, eq(timetableEntry.subjectId, subject.id))
    .leftJoin(teacher, eq(timetableEntry.teacherId, teacher.id));
}
