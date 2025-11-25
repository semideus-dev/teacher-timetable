import { getAllRooms } from "@/modules/timetable/server/hooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rooms = await getAllRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
