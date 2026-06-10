import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitorStats } from "@/lib/db/schema";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await db
      .select()
      .from(visitorStats)
      .where(sql`${visitorStats.date} IN ('total', ${today})`);

    const total = rows.find((r) => r.date === "total")?.count ?? 0;
    const daily = rows.find((r) => r.date === today)?.count ?? 0;

    return NextResponse.json({ daily, total });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch visitor counts" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    await db
      .insert(visitorStats)
      .values({ date: "total", count: 1 })
      .onConflictDoUpdate({
        target: visitorStats.date,
        set: { count: sql`${visitorStats.count} + 1` },
      });

    await db
      .insert(visitorStats)
      .values({ date: today, count: 1 })
      .onConflictDoUpdate({
        target: visitorStats.date,
        set: { count: sql`${visitorStats.count} + 1` },
      });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to increment visitor count" },
      { status: 500 },
    );
  }
}
