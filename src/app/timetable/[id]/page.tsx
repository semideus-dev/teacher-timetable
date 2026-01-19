"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface TimetableEntry {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  subject: { id: string; name: string; code: string } | null;
  teacher: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
}

const LECTURE_SLOTS = [
  "lect-1_(9:00-9:45)",
  "lect-2_(9:45-10:30)",
  "lect-3_(10:30-11:15)",
  "lect-4_(11:15-12:00)",
  "lect-5_(12:00-12:45)",
  "lect-6_(12:45-1:30)",
  "lect-7_(1:30-2:15)",
  "lect-8_(2:15-3:00)",
];

// Normalize lecture slot format for display
function formatLectureSlot(slot: string): string {
  // Convert "lect-1_(9:00-9:45)" to "Lecture 1 (9:00-9:45)"
  const match = slot.match(/lect-(\d+)_\((.+)\)/);
  if (match) {
    return `Lecture ${match[1]} (${match[2]})`;
  }
  return slot;
}

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
  const [isDownloading, setIsDownloading] = useState(false);
  const timetableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!timetableRef.current) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;

      const canvas = await html2canvas(timetableRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${program?.name || "timetable"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
          <Button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1">
                <Download className="mr-2 h-4 w-4" />
                <span>Download PNG</span>
              </div>
            )}
          </Button>
        </div>

        {/* Content to be captured for download */}
        <div ref={timetableRef}>
          <div className="mb-8">
            <div className="bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-xl">
              <h1 className="text-4xl font-bold drop-shadow-md">
                {program?.name || "Timetable"}
              </h1>
              <p className="text-blue-50 mt-2 text-base font-medium">
                Weekly class schedule
              </p>
            </div>
          </div>

          {/* Timetable Grid - Desktop */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-slate-200/50 bg-white shadow-2xl overflow-hidden">
              {/* Header with Days */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                <div className="px-2 py-4 text-xs font-bold text-white border-r border-blue-400/30 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Time Slot</span>
                  <span className="lg:hidden">Time</span>
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`px-2 py-4 text-center text-sm font-bold text-white border-r border-blue-400/30 last:border-r-0 ${
                      index % 2 === 0 ? "bg-white/10" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {LECTURE_SLOTS.map((slot, slotIndex) => {
                const formattedSlot = formatLectureSlot(slot);
                const timeRange = slot.match(/\((.+)\)/)?.[1] || "";
                const colors = [
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                ];

                return (
                  <div
                    key={slot}
                    className="grid grid-cols-7 border-b border-slate-200/80 last:border-b-0 min-h-[120px]"
                  >
                    {/* Time Column */}
                    <div className="px-2 py-4 border-r border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/30 flex flex-col justify-center">
                      <div className="text-xs font-bold text-slate-700">
                        Lec {slotIndex + 1}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                        {timeRange}
                      </div>
                    </div>

                    {/* Day Columns */}
                    {DAYS.map((day, dayIndex) => {
                      const entry = timetable?.find((e) => {
                        if (e.lectureSlot !== slot) return false;
                        const entryDays = parseDayRange(e.dayRange);
                        return entryDays.includes(day);
                      });

                      return (
                        <div
                          key={day}
                          className={`px-2 py-4 border-r border-slate-200/50 last:border-r-0 transition-all duration-200 ${
                            dayIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                          }`}
                        >
                          {entry?.subject ? (
                            <div
                              className={`${
                                colors[slotIndex % colors.length].bg
                              } ${
                                colors[slotIndex % colors.length].border
                              } border rounded-xl p-2 h-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative overflow-hidden`}
                            >
                              <div
                                className={`absolute top-0 left-0 w-1 h-full ${
                                  colors[slotIndex % colors.length].accent
                                }`}
                              />
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                                    {entry.subject.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-white mt-1 px-2 py-0.5 bg-blue-600 rounded-md inline-block shadow-sm">
                                    {entry.subject.code}
                                  </div>
                                </div>
                                {entry.teacher && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-700 font-medium">
                                    <div className="bg-blue-600 p-0.5 rounded">
                                      <User className="h-2.5 w-2.5 shrink-0 text-white" />
                                    </div>
                                    <span className="truncate">
                                      {entry.teacher.name}
                                    </span>
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-700 font-medium">
                                    <div className="bg-blue-600 p-0.5 rounded">
                                      <MapPin className="h-2.5 w-2.5 shrink-0 text-white" />
                                    </div>
                                    <span className="truncate">
                                      {entry.room.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-300">
                              <span className="text-[10px] font-medium">
                                No Class
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timetable Grid - Mobile with horizontal scroll */}
          <div className="md:hidden overflow-x-auto">
            <div className="min-w-max rounded-2xl border border-slate-200/50 bg-white shadow-2xl overflow-hidden">
              {/* Header with Days */}
              <div className="grid grid-cols-[100px_repeat(6,200px)] border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                <div className="px-2 py-4 text-xs font-bold text-white border-r border-blue-400/30 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Time Slot
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`px-4 py-4 text-center text-sm font-bold text-white border-r border-blue-400/30 last:border-r-0 ${
                      index % 2 === 0 ? "bg-white/10" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {LECTURE_SLOTS.map((slot, slotIndex) => {
                const formattedSlot = formatLectureSlot(slot);
                const timeRange = slot.match(/\((.+)\)/)?.[1] || "";
                const colors = [
                  {
                    bg: "bg-linear-to-br from-blue-50 to-blue-100",
                    border: "border-blue-200",
                    text: "text-slate-800",
                    accent: "bg-blue-600",
                  },
                ];

                return (
                  <div
                    key={slot}
                    className="grid grid-cols-[100px_repeat(6,200px)] border-b border-slate-200/80 last:border-b-0 min-h-[120px]"
                  >
                    {/* Time Column */}
                    <div className="px-2 py-4 border-r border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/30 flex flex-col justify-center">
                      <div className="text-xs font-bold text-slate-700">
                        Lec {slotIndex + 1}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                        {timeRange}
                      </div>
                    </div>

                    {/* Day Columns */}
                    {DAYS.map((day, dayIndex) => {
                      const entry = timetable?.find((e) => {
                        if (e.lectureSlot !== slot) return false;
                        const entryDays = parseDayRange(e.dayRange);
                        return entryDays.includes(day);
                      });

                      return (
                        <div
                          key={day}
                          className={`px-3 py-4 border-r border-slate-200/50 last:border-r-0 transition-all duration-200 ${
                            dayIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                          }`}
                        >
                          {entry?.subject ? (
                            <div
                              className={`${colors[0].bg} ${colors[0].border} border rounded-xl p-3 h-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative overflow-hidden`}
                            >
                              <div
                                className={`absolute top-0 left-0 w-1 h-full ${colors[0].accent}`}
                              />
                              <div className="space-y-2 pl-2">
                                <div>
                                  <div className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                                    {entry.subject.name}
                                  </div>
                                  <div className="text-xs font-bold text-white mt-1.5 px-2.5 py-1 bg-blue-600 rounded-md inline-block shadow-sm">
                                    {entry.subject.code}
                                  </div>
                                </div>
                                {entry.teacher && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                    <div className="bg-blue-600 p-1 rounded">
                                      <User className="h-3 w-3 shrink-0 text-white" />
                                    </div>
                                    <span className="truncate">
                                      {entry.teacher.name}
                                    </span>
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                    <div className="bg-blue-600 p-1 rounded">
                                      <MapPin className="h-3 w-3 shrink-0 text-white" />
                                    </div>
                                    <span className="truncate">
                                      {entry.room.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-300">
                              <span className="text-xs font-medium">
                                No Class
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
