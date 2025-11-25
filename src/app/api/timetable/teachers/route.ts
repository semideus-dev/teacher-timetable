import { getAllTeachers } from "@/modules/timetable/server/hooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await getAllTeachers();
    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
