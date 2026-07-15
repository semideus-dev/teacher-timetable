"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Download,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { GroupLegend } from "@/modules/timetable/ui/group-schedule";
import {
  DAYS,
  getDisplaySubjectName,
  getLegendGroups,
  getSessionVisual,
  getSlotDaySessions,
  LECTURE_SLOTS,
  type SessionScope,
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

function TimetableSessionCard({
  entry,
  scope,
  mobile,
}: {
  entry: TimetableEntry;
  scope: SessionScope;
  mobile: boolean;
}) {
  const visual = getSessionVisual(scope);
  const sizeClasses = mobile
    ? {
        card: "p-3",
        title: "text-sm",
        code: "text-xs px-2.5 py-1",
        detail: "text-xs gap-1.5",
        icon: "p-1 h-3 w-3",
      }
    : {
        card: "p-2",
        title: "text-xs",
        code: "text-[10px] px-2 py-0.5",
        detail: "text-[10px] gap-1",
        icon: "p-0.5 h-2.5 w-2.5",
      };

  return (
    <div
      className={`${visual.cardClassName} ${visual.borderClassName} ${sizeClasses.card} relative overflow-hidden rounded-xl border shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${visual.accentClassName}`}
      />
      <div className="space-y-1.5 pl-2">
        <div className="space-y-1">
          <div
            className={`${sizeClasses.title} min-w-0 font-bold leading-tight text-slate-800`}
          >
            {entry.subject?.name
              ? getDisplaySubjectName(entry.subject.name)
              : "Unassigned class"}
          </div>
          {entry.subject?.code && (
            <div
              className={`${sizeClasses.code} ${visual.badgeClassName} inline-block rounded-md font-bold shadow-sm`}
            >
              {entry.subject.code}
            </div>
          )}
        </div>
        {entry.teacher && (
          <div
            className={`flex items-center ${sizeClasses.detail} font-medium text-slate-700`}
          >
            <div className={`${visual.iconClassName} rounded`}>
              <User className={`${sizeClasses.icon} shrink-0 text-white`} />
            </div>
            <span className="truncate">{entry.teacher.name}</span>
          </div>
        )}
        {entry.room && (
          <div
            className={`flex items-center ${sizeClasses.detail} font-medium text-slate-700`}
          >
            <div className={`${visual.iconClassName} rounded`}>
              <MapPin className={`${sizeClasses.icon} shrink-0 text-white`} />
            </div>
            <span className="truncate">{entry.room.name}</span>
          </div>
        )}
      </div>
    </div>
  );
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
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
  const legendGroups = getLegendGroups(timetable ?? []);

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
        <div className="mb-4 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              className="transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
          <Button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="bg-blue-600 font-semibold text-white shadow-lg hover:bg-blue-700"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PNG
          </Button>
        </div>

        <div ref={timetableRef}>
          <div className="mb-6 rounded-2xl bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold drop-shadow-md">
              {program?.name || "Timetable"}
            </h1>
            <p className="mt-2 text-base font-medium text-blue-50">
              Weekly class schedule
            </p>
          </div>

          <div className="mb-4">
            <GroupLegend groups={legendGroups} />
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                <div className="flex items-center gap-1.5 border-r border-blue-400/30 px-2 py-4 text-xs font-bold text-white">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Time Slot</span>
                  <span className="lg:hidden">Time</span>
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`border-r border-blue-400/30 px-2 py-4 text-center text-sm font-bold text-white last:border-r-0 ${
                      index % 2 === 0 ? "bg-white/10" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {LECTURE_SLOTS.map((slot, slotIndex) => {
                const timeRange = slot.match(/\((.+)\)/)?.[1] || "";
                return (
                  <div
                    key={slot}
                    className="grid min-h-[120px] grid-cols-7 border-b border-slate-200/80 last:border-b-0"
                  >
                    <div className="flex flex-col justify-center border-r border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/30 px-2 py-4">
                      <div className="text-xs font-bold text-slate-700">
                        Lec {slotIndex + 1}
                      </div>
                      <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                        {timeRange}
                      </div>
                    </div>
                    {DAYS.map((day, dayIndex) => {
                      const sessions = getSlotDaySessions(
                        timetable ?? [],
                        slot,
                        day,
                      );
                      return (
                        <div
                          key={day}
                          className={`border-r border-slate-200/50 px-2 py-4 last:border-r-0 ${
                            dayIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                          }`}
                        >
                          {sessions.length > 0 ? (
                            <div className="space-y-2">
                              {sessions.map(({ entry, scope }) => (
                                <TimetableSessionCard
                                  key={entry.id}
                                  entry={entry}
                                  scope={scope}
                                  mobile={false}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex h-full min-h-[88px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 text-slate-400">
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

          <div className="overflow-x-auto md:hidden">
            <div className="min-w-max overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-2xl">
              <div className="grid grid-cols-[100px_repeat(6,200px)] border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                <div className="flex items-center gap-1.5 border-r border-blue-400/30 px-2 py-4 text-xs font-bold text-white">
                  <Clock className="h-4 w-4" />
                  Time Slot
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`border-r border-blue-400/30 px-4 py-4 text-center text-sm font-bold text-white last:border-r-0 ${
                      index % 2 === 0 ? "bg-white/10" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {LECTURE_SLOTS.map((slot, slotIndex) => {
                const timeRange = slot.match(/\((.+)\)/)?.[1] || "";
                return (
                  <div
                    key={slot}
                    className="grid min-h-[120px] grid-cols-[100px_repeat(6,200px)] border-b border-slate-200/80 last:border-b-0"
                  >
                    <div className="flex flex-col justify-center border-r border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/30 px-2 py-4">
                      <div className="text-xs font-bold text-slate-700">
                        Lec {slotIndex + 1}
                      </div>
                      <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                        {timeRange}
                      </div>
                    </div>
                    {DAYS.map((day, dayIndex) => {
                      const sessions = getSlotDaySessions(
                        timetable ?? [],
                        slot,
                        day,
                      );
                      return (
                        <div
                          key={day}
                          className={`border-r border-slate-200/50 px-3 py-4 last:border-r-0 ${
                            dayIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                          }`}
                        >
                          {sessions.length > 0 ? (
                            <div className="space-y-2">
                              {sessions.map(({ entry, scope }) => (
                                <TimetableSessionCard
                                  key={entry.id}
                                  entry={entry}
                                  scope={scope}
                                  mobile
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex h-full min-h-[88px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 text-slate-400">
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
