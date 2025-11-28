import "dotenv/config";
import { db } from "./index";
import {
  user,
  session,
  account,
  verification,
  program,
  teacher,
  room,
  subject,
  timetableEntry,
} from "./schema";

async function truncateDatabase() {
  try {
    console.log("🗑️  Starting database truncation...");

    // Delete in order to respect foreign key constraints
    // Delete timetable entries first (has foreign keys to program, subject, teacher, room)
    console.log("Deleting timetable entries...");
    await db.delete(timetableEntry);

    // Delete auth-related tables
    console.log("Deleting sessions...");
    await db.delete(session);

    console.log("Deleting accounts...");
    await db.delete(account);

    console.log("Deleting verifications...");
    await db.delete(verification);

    console.log("Deleting users...");
    await db.delete(user);

    // Delete timetable-related tables
    console.log("Deleting subjects...");
    await db.delete(subject);

    console.log("Deleting teachers...");
    await db.delete(teacher);

    console.log("Deleting rooms...");
    await db.delete(room);

    console.log("Deleting programs...");
    await db.delete(program);

    console.log("✅ Database truncated successfully!");
  } catch (error) {
    console.error("❌ Error truncating database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

truncateDatabase();
