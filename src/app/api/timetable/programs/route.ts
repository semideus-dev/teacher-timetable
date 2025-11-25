import { getAllPrograms } from "@/modules/timetable/server/hooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const programs = await getAllPrograms();
    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}
