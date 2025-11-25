import { getTimetableEntries } from "@/modules/timetable/server/hooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const entries = await getTimetableEntries();
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch timetable entries" },
      { status: 500 }
    );
  }
}
