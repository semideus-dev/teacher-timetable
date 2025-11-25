"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TimetableEntry {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  subject: { id: string; name: string; code: string } | null;
  teacher: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
}

const LECTURE_SLOTS = [
  "Lect-1 (9:00-9:45)",
  "Lect-2 (9:45-10:30)",
  "Lect-3 (10:30-11:15)",
  "Lect-4 (11:15-12:00)",
  "Lect-5 (12:00-12:45)",
  "Lect-6 (12:45-1:30)",
  "Lect-7 (1:30-2:15)",
  "Lect-8 (2:15-3:00)",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDayRange(dayRange: string | null): string[] {
  if (!dayRange) return DAYS;
  const match = dayRange.match(/\((\d+)-(\d+)\)/);
  if (!match) return DAYS;
  const start = Number.parseInt(match[1]);
  const end = Number.parseInt(match[2]);
  return DAYS.slice(start - 1, end);
}

export default function TimetablePage() {
  const params = useParams();
  const programId = params.id as string;

  const { data: timetable, isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", programId],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/program/${programId}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      return res.json();
    },
  });

  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await fetch("/api/timetable/programs");
      return res.json();
    },
  });

  const program = programs?.find((p: any) => p.id === programId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {program?.name || "Timetable"}
          </h1>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Room
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Days
                </th>
              </tr>
            </thead>
            <tbody>
              {LECTURE_SLOTS.map((slot) => {
                const entry = timetable?.find((e) => e.lectureSlot === slot);
                return (
                  <tr key={slot} className="border-b border-slate-100">
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">
                      {slot}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry?.subject?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {entry?.subject?.code || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry?.teacher?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry?.room?.name || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {parseDayRange(entry?.dayRange || null).map((day) => (
                          <span
                            key={day}
                            className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {LECTURE_SLOTS.map((slot) => {
            const entry = timetable?.find((e) => e.lectureSlot === slot);
            if (!entry?.subject) return null;

            return (
              <div
                key={slot}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-900" />
                  <span className="font-semibold text-slate-900">{slot}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {entry.subject?.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {entry.subject?.code}
                    </p>
                  </div>
                  {entry.teacher && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{entry.teacher.name}</span>
                    </div>
                  )}
                  {entry.room && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{entry.room.name}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {parseDayRange(entry.dayRange).map((day) => (
                      <span
                        key={day}
                        className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
