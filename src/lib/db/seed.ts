import "dotenv/config";
import { db } from "./index";
import { program, teacher, room, subject, timetableEntry } from "./schema";
import inputData from "../../../output.json";

interface OtherUniqueRow {
  feild_name: string;
  [key: string]: string | undefined;
}

interface ProgramData {
  program_name: string;
  entries_count: number;
  other_unique_rows: OtherUniqueRow[];
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

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Maps to store IDs for relationships
    const programMap = new Map<string, string>();
    const teacherMap = new Map<string, string>();
    const roomMap = new Map<string, string>();
    const subjectMap = new Map<string, string>();

    const programs: ProgramData[] = inputData.programs;
    console.log(`📚 Found ${programs.length} programs`);

    // Step 1: Insert all programs
    console.log("\n📋 Inserting programs...");
    for (const prog of programs) {
      const [result] = await db
        .insert(program)
        .values({
          name: prog.program_name,
          entriesCount: prog.entries_count,
        })
        .returning();
      programMap.set(prog.program_name, result.id);
      console.log(`  ✓ ${prog.program_name} (${prog.entries_count} entries)`);
    }

    // Step 2: Collect and insert all unique teachers
    console.log("\n👨‍🏫 Collecting teachers...");
    const uniqueTeachers = new Set<string>();
    for (const prog of programs) {
      const teacherRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Teacher"
      );
      for (const row of teacherRows) {
        for (const slot of lectureSlots) {
          const teacherName = row[slot];
          if (teacherName && teacherName.trim() !== "") {
            // Handle multiple teachers separated by /
            teacherName.split("/").forEach((name) => {
              const trimmedName = name.trim();
              if (trimmedName && !trimmedName.startsWith("NEW")) {
                uniqueTeachers.add(trimmedName);
              }
            });
          }
        }
      }
    }
    console.log(`  Found ${uniqueTeachers.size} unique teachers`);
    console.log("  Inserting teachers...");
    for (const teacherName of uniqueTeachers) {
      const [result] = await db
        .insert(teacher)
        .values({ name: teacherName })
        .returning();
      teacherMap.set(teacherName, result.id);
      console.log(`    ✓ ${teacherName}`);
    }

    // Step 3: Collect and insert all unique rooms
    console.log("\n🏫 Collecting rooms...");
    const uniqueRooms = new Set<string>();
    for (const prog of programs) {
      const roomRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Room"
      );
      for (const row of roomRows) {
        for (const slot of lectureSlots) {
          const roomName = row[slot];
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
    }
    console.log(`  Found ${uniqueRooms.size} unique rooms`);
    console.log("  Inserting rooms...");
    for (const roomName of uniqueRooms) {
      const [result] = await db
        .insert(room)
        .values({ name: roomName })
        .returning();
      roomMap.set(roomName, result.id);
      console.log(`    ✓ ${roomName}`);
    }

    // Step 4: Collect and insert all unique subjects
    console.log("\n📖 Collecting subjects...");
    const uniqueSubjects = new Map<string, string>(); // code -> name
    for (const prog of programs) {
      const subjectRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "subject"
      );
      const codeRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Code"
      );

      // Process each subject row with corresponding code row
      for (let i = 0; i < subjectRows.length; i++) {
        const subjectRow = subjectRows[i];
        const codeRow = codeRows[i];
        if (!subjectRow || !codeRow) continue;

        for (const slot of lectureSlots) {
          const subjectName = subjectRow[slot];
          const subjectCode = codeRow[slot];
          if (
            subjectName &&
            subjectCode &&
            subjectName.trim() !== "" &&
            subjectCode.trim() !== ""
          ) {
            // Handle multiple subjects/codes separated by /
            const subjectNames = subjectName.split("/");
            const subjectCodes = subjectCode.split("/");

            for (let j = 0; j < subjectCodes.length; j++) {
              const code = subjectCodes[j]?.trim();
              const name = subjectNames[j]?.trim() || subjectNames[0]?.trim();
              if (code && name) {
                uniqueSubjects.set(code, name);
              }
            }
          }
        }
      }
    }
    console.log(`  Found ${uniqueSubjects.size} unique subjects`);
    console.log("  Inserting subjects...");
    for (const [code, name] of uniqueSubjects.entries()) {
      const [result] = await db
        .insert(subject)
        .values({ name, code })
        .returning();
      subjectMap.set(code, result.id);
      console.log(`    ✓ ${code}: ${name}`);
    }

    // Step 5: Insert timetable entries
    console.log("\n🗓️  Inserting timetable entries...");
    let totalEntries = 0;

    for (const prog of programs) {
      const programId = programMap.get(prog.program_name);
      if (!programId) continue;

      let programEntries = 0;

      // Get all row types
      const subjectRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "subject"
      );
      const codeRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Code"
      );
      const teacherRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Teacher"
      );
      const roomRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Room"
      );
      const dayRows = prog.other_unique_rows.filter(
        (row) => row.feild_name === "Day"
      );

      // Process each set of rows (each set represents alternative schedules)
      const maxSets = Math.max(
        subjectRows.length,
        codeRows.length,
        teacherRows.length,
        roomRows.length,
        dayRows.length
      );

      for (let setIndex = 0; setIndex < maxSets; setIndex++) {
        const subjectRow = subjectRows[setIndex];
        const codeRow = codeRows[setIndex];
        const teacherRow = teacherRows[setIndex];
        const roomRow = roomRows[setIndex];
        const dayRow = dayRows[setIndex];

        if (!subjectRow || !codeRow) continue;

        // Process each lecture slot
        for (const slot of lectureSlots) {
          const subjectName = subjectRow[slot];
          const subjectCode = codeRow[slot];
          const teacherName = teacherRow?.[slot];
          const roomName = roomRow?.[slot];
          const dayRange = dayRow?.[slot];

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
              tName && !tName.startsWith("NEW")
                ? teacherMap.get(tName)
                : undefined;
            const roomId = rName ? roomMap.get(rName) : undefined;

            await db.insert(timetableEntry).values({
              programId,
              subjectId: subjectId || null,
              teacherId: teacherId || null,
              roomId: roomId || null,
              lectureSlot: slot,
              dayRange: dayRange || null,
            });

            programEntries++;
            totalEntries++;
          }
        }
      }

      console.log(
        `  ✓ ${prog.program_name}: ${programEntries} entries inserted`
      );
    }

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Programs: ${programMap.size}`);
    console.log(`   - Teachers: ${teacherMap.size}`);
    console.log(`   - Rooms: ${roomMap.size}`);
    console.log(`   - Subjects: ${subjectMap.size}`);
    console.log(`   - Timetable Entries: ${totalEntries}`);
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
