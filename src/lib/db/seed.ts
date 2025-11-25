import "dotenv/config";
import { db } from "./index";
import { program, teacher, room, subject, timetableEntry } from "./schema";
import outputData from "../../../output.json";

interface TimetableRow {
  "Program Name": string;
  "Feild Name": string;
  "Lect-1 (9:00-9:45)": string | null;
  "Lect-2 (9:45-10:30)": string | null;
  "Lect-3 (10:30-11:15)": string | null;
  "Lect-4 (11:15-12:00)": string | null;
  "Lect-5 (12:00-12:45)": string | null;
  "Lect-6 (12:45-1:30)": string | null;
  "Lect-7 (1:30-2:15)": string | null;
  "Lect-8 (2:15-3:00)": string | null;
}

const lectureSlots = [
  "Lect-1 (9:00-9:45)",
  "Lect-2 (9:45-10:30)",
  "Lect-3 (10:30-11:15)",
  "Lect-4 (11:15-12:00)",
  "Lect-5 (12:00-12:45)",
  "Lect-6 (12:45-1:30)",
  "Lect-7 (1:30-2:15)",
  "Lect-8 (2:15-3:00)",
] as const;

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Maps to store IDs for relationships
    const programMap = new Map<string, string>();
    const teacherMap = new Map<string, string>();
    const roomMap = new Map<string, string>();
    const subjectMap = new Map<string, string>();

    // Group data by program
    const programGroups = new Map<
      string,
      {
        subject: TimetableRow;
        code: TimetableRow;
        teacher: TimetableRow;
        room: TimetableRow;
        day: TimetableRow;
      }
    >();

    for (let i = 0; i < outputData.length; i += 5) {
      const programName = outputData[i]["Program Name"];
      programGroups.set(programName, {
        subject: outputData[i] as TimetableRow,
        code: outputData[i + 1] as TimetableRow,
        teacher: outputData[i + 2] as TimetableRow,
        room: outputData[i + 3] as TimetableRow,
        day: outputData[i + 4] as TimetableRow,
      });
    }

    console.log(`📚 Found ${programGroups.size} programs`);

    // Step 1: Insert all unique programs
    console.log("\n📋 Inserting programs...");
    for (const programName of programGroups.keys()) {
      const [result] = await db
        .insert(program)
        .values({ name: programName })
        .returning();
      programMap.set(programName, result.id);
      console.log(`  ✓ ${programName}`);
    }

    // Step 2: Collect and insert all unique teachers
    console.log("\n👨‍🏫 Inserting teachers...");
    const uniqueTeachers = new Set<string>();
    for (const group of programGroups.values()) {
      for (const slot of lectureSlots) {
        const teacherName = group.teacher[slot];
        if (teacherName && teacherName.trim() !== "") {
          // Handle multiple teachers separated by /
          teacherName.split("/").forEach((name) => {
            const trimmedName = name.trim();
            if (trimmedName && trimmedName !== "NEW") {
              uniqueTeachers.add(trimmedName);
            }
          });
        }
      }
    }
    for (const teacherName of uniqueTeachers) {
      const [result] = await db
        .insert(teacher)
        .values({ name: teacherName })
        .returning();
      teacherMap.set(teacherName, result.id);
      console.log(`  ✓ ${teacherName}`);
    }

    // Step 3: Collect and insert all unique rooms
    console.log("\n🏫 Inserting rooms...");
    const uniqueRooms = new Set<string>();
    for (const group of programGroups.values()) {
      for (const slot of lectureSlots) {
        const roomName = group.room[slot];
        if (roomName && roomName.trim() !== "") {
          // Handle multiple rooms separated by /
          roomName.split("/").forEach((name) => {
            const trimmedName = name.trim();
            if (trimmedName) {
              uniqueRooms.add(trimmedName);
            }
          });
        }
      }
    }
    for (const roomName of uniqueRooms) {
      const [result] = await db
        .insert(room)
        .values({ name: roomName })
        .returning();
      roomMap.set(roomName, result.id);
      console.log(`  ✓ ${roomName}`);
    }

    // Step 4: Collect and insert all unique subjects
    console.log("\n📖 Inserting subjects...");
    const uniqueSubjects = new Map<string, string>(); // code -> name
    for (const group of programGroups.values()) {
      for (const slot of lectureSlots) {
        const subjectName = group.subject[slot];
        const subjectCode = group.code[slot];
        if (
          subjectName &&
          subjectCode &&
          subjectName.trim() !== "" &&
          subjectCode.trim() !== ""
        ) {
          // Handle multiple subjects/codes separated by /
          const subjectNames = subjectName.split("/");
          const subjectCodes = subjectCode.split("/");

          for (let i = 0; i < subjectCodes.length; i++) {
            const code = subjectCodes[i]?.trim();
            const name = subjectNames[i]?.trim() || subjectNames[0]?.trim();
            if (code && name) {
              uniqueSubjects.set(code, name);
            }
          }
        }
      }
    }
    for (const [code, name] of uniqueSubjects.entries()) {
      const [result] = await db
        .insert(subject)
        .values({ name, code })
        .returning();
      subjectMap.set(code, result.id);
      console.log(`  ✓ ${code}: ${name}`);
    }

    // Step 5: Insert timetable entries
    console.log("\n🗓️  Inserting timetable entries...");
    let entryCount = 0;
    for (const [programName, group] of programGroups.entries()) {
      const programId = programMap.get(programName);
      if (!programId) continue;

      for (const slot of lectureSlots) {
        const subjectName = group.subject[slot];
        const subjectCode = group.code[slot];
        const teacherName = group.teacher[slot];
        const roomName = group.room[slot];
        const dayRange = group.day[slot];

        // Skip empty slots
        if (!subjectName && !subjectCode) continue;

        // Handle multiple entries (separated by /)
        const subjectCodes = subjectCode?.split("/").map((s) => s.trim()) || [
          null,
        ];
        const teacherNames = teacherName?.split("/").map((s) => s.trim()) || [
          null,
        ];
        const roomNames = roomName?.split("/").map((s) => s.trim()) || [null];

        // Create entries for each combination
        const maxLength = Math.max(
          subjectCodes.length,
          teacherNames.length,
          roomNames.length
        );

        for (let i = 0; i < maxLength; i++) {
          const code = subjectCodes[i] || subjectCodes[0];
          const tName = teacherNames[i] || teacherNames[0];
          const rName = roomNames[i] || roomNames[0];

          const subjectId = code ? subjectMap.get(code) : undefined;
          const teacherId =
            tName && tName !== "NEW" ? teacherMap.get(tName) : undefined;
          const roomId = rName ? roomMap.get(rName) : undefined;

          await db.insert(timetableEntry).values({
            programId,
            subjectId: subjectId || null,
            teacherId: teacherId || null,
            roomId: roomId || null,
            lectureSlot: slot,
            dayRange: dayRange || null,
          });

          entryCount++;
        }
      }
      console.log(`  ✓ ${programName}: ${entryCount} entries`);
    }

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Programs: ${programMap.size}`);
    console.log(`   - Teachers: ${teacherMap.size}`);
    console.log(`   - Rooms: ${roomMap.size}`);
    console.log(`   - Subjects: ${subjectMap.size}`);
    console.log(`   - Timetable Entries: ${entryCount}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding error:", error);
    process.exit(1);
  });
