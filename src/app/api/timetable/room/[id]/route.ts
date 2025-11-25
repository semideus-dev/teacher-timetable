import { getTimetableByRoom } from "@/modules/timetable/server/hooks";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timetable = await getTimetableByRoom(id);
    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
