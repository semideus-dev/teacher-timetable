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
import type { ReactNode } from "react";
import { Fragment, useMemo, useRef, useState } from "react";
import { FilterBar } from "@/components/filter-bar";
import { Navbar } from "@/components/navbar";
import { ProgramCard } from "@/components/program-card";
import { Button } from "@/components/ui/button";
import {
  usePrograms,
  useRooms,
  useTeachers,
} from "@/modules/timetable/hooks/use-timetable";
import {
  AttendancePills,
  GroupLegend,
} from "@/modules/timetable/ui/group-schedule";
import {
  getDisplaySubjectName,
  getLegendGroups,
  LECTURE_SLOTS,
} from "@/modules/timetable/utils/group-schedule";

// Normalize lecture slot format for display
function formatLectureSlot(slot: string): ReactNode {
  // Convert "lect-1_(9:00-9:45)" to:
  // Lecture - 1
  // (9:00-9:45)
  const match = slot.match(/lect-(\d+)_\((.+)\)/);
  if (match) {
    return (
      <>
        {`Lecture - ${match[1]}`}
        <br />
        {`(${match[2]})`}
      </>
    );
  }
  return slot;
}

interface FilteredTimetableEntry {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  program?: { id: string; name: string } | null;
  subject?: { id: string; name: string; code: string } | null;
  teacher?: { id: string; name: string } | null;
  room?: { id: string; name: string } | null;
}

export default function Home() {
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: rooms, isLoading: roomsLoading } = useRooms();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [selectedProgram, setSelectedProgram] = useState<string>();
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
      const title = showTeacherView
        ? `${teacher?.name}-timetable`
        : showRoomView
          ? `room-${room?.name}-schedule`
          : program?.name || "timetable";
      link.download = `${title}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch teacher-specific timetable
  const { data: teacherTimetable, isLoading: teacherLoading } = useQuery<
    FilteredTimetableEntry[] | null
  >({
    queryKey: ["teacher-timetable", selectedTeacher],
    queryFn: async () => {
      if (!selectedTeacher || selectedTeacher === "all") return null;
      const res = await fetch(`/api/timetable/teacher/${selectedTeacher}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedTeacher && selectedTeacher !== "all",
  });

  // Fetch room-specific timetable
  const { data: roomTimetable, isLoading: roomLoading } = useQuery<
    FilteredTimetableEntry[] | null
  >({
    queryKey: ["room-timetable", selectedRoom],
    queryFn: async () => {
      if (!selectedRoom || selectedRoom === "all") return null;
      const res = await fetch(`/api/timetable/room/${selectedRoom}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedRoom && selectedRoom !== "all",
  });

  // Fetch program-specific timetable
  const { data: programTimetable, isLoading: programLoading } = useQuery<
    FilteredTimetableEntry[] | null
  >({
    queryKey: ["program-timetable", selectedProgram],
    queryFn: async () => {
      if (!selectedProgram || selectedProgram === "all") return null;
      const res = await fetch(`/api/timetable/program/${selectedProgram}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedProgram && selectedProgram !== "all",
  });

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];

    return programs.filter((program) => {
      const matchesSearch = program.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [programs, searchQuery]);

  const handleResetFilters = () => {
    setSelectedTeacher(undefined);
    setSelectedRoom(undefined);
    setSelectedProgram(undefined);
  };

  // Determine which filtered view to show
  const showTeacherView = selectedTeacher && selectedTeacher !== "all";
  const showRoomView = selectedRoom && selectedRoom !== "all";
  const showProgramView = selectedProgram && selectedProgram !== "all";

  const teacher = teachers?.find((t) => t.id === selectedTeacher);
  const room = rooms?.find((r) => r.id === selectedRoom);
  const program = programs?.find((p) => p.id === selectedProgram);

  if (programsLoading || teachersLoading || roomsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  // Show filtered timetable view
  if (showTeacherView || showRoomView || showProgramView) {
    const timetable = teacherTimetable || roomTimetable || programTimetable;
    const isLoading = teacherLoading || roomLoading || programLoading;
    const title = showTeacherView
      ? `${teacher?.name}'s Timetable`
      : showRoomView
        ? `Room ${room?.name} Schedule`
        : program?.name || "Timetable";

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <FilterBar
            teachers={teachers || []}
            rooms={rooms || []}
            programs={programs || []}
            onSearchChange={setSearchQuery}
            onTeacherChange={setSelectedTeacher}
            onRoomChange={setSelectedRoom}
            onProgramChange={setSelectedProgram}
            selectedTeacher={selectedTeacher}
            selectedRoom={selectedRoom}
            selectedProgram={selectedProgram}
          />

          <div className="flex items-center justify-between my-4">
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
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

          <div ref={timetableRef}>
            <div className="mb-8">
              <div className="bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-4xl font-bold drop-shadow-md">{title}</h1>
                <p className="text-blue-50 mt-2 text-base font-medium">
                  Filtered schedule view
                </p>
              </div>
            </div>

            <div className="mb-4">
              <GroupLegend groups={getLegendGroups(timetable || [])} />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-slate-200 shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-2xl border border-slate-200/50 bg-white shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                          <th className="px-3 py-4 text-left text-sm font-bold text-white whitespace-nowrap">
                            Time
                          </th>
                          <th className="px-3 py-4 text-left text-sm font-bold text-white">
                            Subject
                          </th>
                          <th className="px-3 py-4 text-left text-sm font-bold text-white whitespace-nowrap">
                            Code
                          </th>
                          {showTeacherView ? (
                            <th className="px-3 py-4 text-left text-sm font-bold text-white">
                              Class
                            </th>
                          ) : (
                            <th className="px-3 py-4 text-left text-sm font-bold text-white">
                              Teacher
                            </th>
                          )}
                          {!showRoomView && (
                            <th className="px-3 py-4 text-left text-sm font-bold text-white whitespace-nowrap">
                              Room
                            </th>
                          )}
                          <th className="px-3 py-4 text-left text-sm font-bold text-white whitespace-nowrap">
                            Days
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {LECTURE_SLOTS.map((slot) => {
                          const entries =
                            timetable?.filter(
                              (entry) => entry.lectureSlot === slot,
                            ) || [];
                          if (entries.length === 0) return null;

                          return (
                            <Fragment key={slot}>
                              {/* Lecture slot header row */}
                              <tr
                                key={`${slot}-header`}
                                className="bg-slate-100 border-t-2 border-slate-300"
                              >
                                <td
                                  colSpan={showRoomView ? 5 : 6}
                                  className="px-3 py-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <span className="text-sm font-bold text-slate-800">
                                      {formatLectureSlot(slot)}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-600 font-medium whitespace-nowrap">
                                      {entries.length}{" "}
                                      {entries.length === 1
                                        ? "class"
                                        : "classes"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {/* Entries for this slot */}
                              {entries.map((entry) => (
                                <tr
                                  key={entry.id}
                                  className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors bg-white"
                                >
                                  <td className="px-3 py-3 text-xs text-slate-500 font-medium">
                                    {/* Empty cell for alignment */}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">
                                    {entry?.subject?.name
                                      ? getDisplaySubjectName(
                                          entry.subject.name,
                                        )
                                      : "-"}
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="text-xs font-bold text-white bg-blue-500 px-2.5 py-1 rounded-full whitespace-nowrap">
                                      {entry?.subject?.code || "-"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                    {showTeacherView
                                      ? entry?.program?.name || "-"
                                      : entry?.teacher?.name || "-"}
                                  </td>
                                  {!showRoomView && (
                                    <td className="px-3 py-3 text-sm font-medium text-slate-700">
                                      {entry?.room?.name || "-"}
                                    </td>
                                  )}
                                  <td className="px-3 py-3">
                                    <AttendancePills entry={entry} />
                                  </td>
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-6">
                  {LECTURE_SLOTS.map((slot) => {
                    const entries =
                      timetable?.filter(
                        (entry) => entry.lectureSlot === slot,
                      ) || [];
                    if (entries.length === 0) return null;

                    return (
                      <div key={slot} className="space-y-3">
                        {/* Lecture Slot Header */}
                        <div className="bg-slate-100 border-l-4 border-blue-600 p-4 rounded-lg shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <span className="font-bold text-slate-800">
                                {formatLectureSlot(slot)}
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 font-medium bg-white px-3 py-1 rounded-full">
                              {entries.length}{" "}
                              {entries.length === 1 ? "class" : "classes"}
                            </span>
                          </div>
                        </div>

                        {/* Entries for this slot */}
                        <div className="space-y-3 pl-2">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 shadow-md hover:shadow-lg transition-all"
                            >
                              <div className="space-y-3">
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                  <p className="text-sm font-bold text-slate-800">
                                    {entry.subject?.name
                                      ? getDisplaySubjectName(
                                          entry.subject.name,
                                        )
                                      : "Unassigned class"}
                                  </p>
                                  <p className="text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-md inline-block mt-1.5 shadow-sm">
                                    {entry.subject?.code}
                                  </p>
                                </div>
                                {showTeacherView
                                  ? entry.program && (
                                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                        <div className="bg-blue-600 p-1.5 rounded-lg shadow">
                                          <User className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-800 text-sm">
                                          {entry.program.name}
                                        </span>
                                      </div>
                                    )
                                  : entry.teacher && (
                                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                        <div className="bg-blue-600 p-1.5 rounded-lg shadow">
                                          <User className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-800 text-sm">
                                          {entry.teacher.name}
                                        </span>
                                      </div>
                                    )}
                                {!showRoomView && entry.room && (
                                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                    <div className="bg-blue-600 p-1.5 rounded-lg shadow">
                                      <MapPin className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-800 text-sm">
                                      {entry.room.name}
                                    </span>
                                  </div>
                                )}
                                <AttendancePills entry={entry} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-xl mb-6">
            <h1 className="text-4xl font-bold drop-shadow-md mb-2">
              Timetable Dashboard
            </h1>
            <p className="text-blue-50 text-lg font-medium">
              Select a program to view its timetable
            </p>
          </div>
        </div>

        <FilterBar
          teachers={teachers || []}
          rooms={rooms || []}
          programs={programs || []}
          onSearchChange={setSearchQuery}
          onTeacherChange={setSelectedTeacher}
          onRoomChange={setSelectedRoom}
          onProgramChange={setSelectedProgram}
          selectedTeacher={selectedTeacher}
          selectedRoom={selectedRoom}
          selectedProgram={selectedProgram}
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-slate-200 shadow-lg">
            <p className="text-slate-600 text-lg font-medium">
              No programs found
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
