"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  AttendancePills,
  GroupLegend,
} from "@/modules/timetable/ui/group-schedule";
import {
  getDisplaySubjectName,
  getLegendGroups,
  LECTURE_SLOTS,
} from "@/modules/timetable/utils/group-schedule";

interface TimetableEntry {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  subject: { id: string; name: string; code: string } | null;
  teacher: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
}

interface Program {
  id: string;
  name: string;
}

function formatLectureSlot(slot: string): string {
  const match = slot.match(/lect-(\d+)_\((.+)\)/);
  return match ? `Lecture ${match[1]} (${match[2]})` : slot;
}

export default function DashboardTimetablePage() {
  const params = useParams();
  const programId = params.id as string;

  const { data: timetable, isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", programId],
    queryFn: async () => {
      const response = await fetch(`/api/timetable/program/${programId}`);
      if (!response.ok) throw new Error("Failed to fetch timetable");
      return response.json();
    },
  });

  const { data: programs } = useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await fetch("/api/timetable/programs");
      if (!response.ok) throw new Error("Failed to fetch programs");
      return response.json();
    },
  });

  const program = programs?.find((item) => item.id === programId);

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="mb-4">
          <GroupLegend groups={getLegendGroups(timetable ?? [])} />
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-[18%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Time
                </th>
                <th className="w-[22%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Subject
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Code
                </th>
                <th className="w-[18%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Teacher
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Room
                </th>
                <th className="w-[18%] px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Days
                </th>
              </tr>
            </thead>
            <tbody>
              {LECTURE_SLOTS.map((slot) => {
                const entries =
                  timetable?.filter((entry) => entry.lectureSlot === slot) ??
                  [];

                if (entries.length === 0) {
                  return (
                    <tr key={slot} className="border-b border-slate-100">
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {formatLectureSlot(slot)}
                      </td>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-sm text-slate-400"
                      >
                        No class
                      </td>
                    </tr>
                  );
                }

                return entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 align-top"
                  >
                    {index === 0 && (
                      <td
                        rowSpan={entries.length}
                        className="px-4 py-4 text-sm font-medium text-slate-900"
                      >
                        {formatLectureSlot(slot)}
                      </td>
                    )}
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry.subject?.name
                        ? getDisplaySubjectName(entry.subject.name)
                        : "Unassigned class"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {entry.subject?.code || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry.teacher?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {entry.room?.name || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <AttendancePills entry={entry} />
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 md:hidden">
          {LECTURE_SLOTS.map((slot) => {
            const entries =
              timetable?.filter((entry) => entry.lectureSlot === slot) ?? [];
            if (entries.length === 0) return null;

            return (
              <section key={slot} className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border-l-4 border-blue-600 bg-slate-100 p-4 shadow-md">
                  <Clock className="h-4 w-4 text-blue-900" />
                  <span className="font-semibold text-slate-900">
                    {formatLectureSlot(slot)}
                  </span>
                </div>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {entry.subject?.name
                          ? getDisplaySubjectName(entry.subject.name)
                          : "Unassigned class"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {entry.subject?.code || "-"}
                      </p>
                    </div>
                    <div className="space-y-2">
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
                      <AttendancePills entry={entry} />
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
