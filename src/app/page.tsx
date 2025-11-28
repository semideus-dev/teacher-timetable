"use client";

import { Navbar } from "@/components/navbar";
import { FilterBar } from "@/components/filter-bar";
import { ProgramCard } from "@/components/program-card";
import {
  usePrograms,
  useTeachers,
  useRooms,
} from "@/modules/timetable/hooks/use-timetable";
import { useState, useMemo } from "react";
import { Loader2, Clock, User, MapPin, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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

export default function Home() {
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: rooms, isLoading: roomsLoading } = useRooms();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [selectedProgram, setSelectedProgram] = useState<string>();

  // Fetch teacher-specific timetable
  const { data: teacherTimetable, isLoading: teacherLoading } = useQuery({
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
  const { data: roomTimetable, isLoading: roomLoading } = useQuery({
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
  const { data: programTimetable, isLoading: programLoading } = useQuery({
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

          <div className="mt-8 mb-8">
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="mb-6 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
            <div className="bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-xl">
              <h1 className="text-4xl font-bold drop-shadow-md">{title}</h1>
              <p className="text-blue-50 mt-2 text-base font-medium">
                Filtered schedule view
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-slate-200 shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500">
                      <th className="px-4 py-4 text-left text-sm font-bold text-white">
                        Time
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-bold text-white">
                        Subject
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-bold text-white">
                        Code
                      </th>
                      {showTeacherView ? (
                        <th className="px-4 py-4 text-left text-sm font-bold text-white">
                          Class
                        </th>
                      ) : (
                        <th className="px-4 py-4 text-left text-sm font-bold text-white">
                          Teacher
                        </th>
                      )}
                      {!showRoomView && (
                        <th className="px-4 py-4 text-left text-sm font-bold text-white">
                          Room
                        </th>
                      )}
                      <th className="px-4 py-4 text-left text-sm font-bold text-white">
                        Days
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LECTURE_SLOTS.map((slot, index) => {
                      const entry = timetable?.find(
                        (e: any) => e.lectureSlot === slot
                      );
                      if (!entry) return null;
                      return (
                        <tr
                          key={slot}
                          className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
                            index % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-4 text-sm font-bold text-slate-700">
                            {formatLectureSlot(slot)}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                            {entry?.subject?.name || "-"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs font-bold text-white bg-blue-500 px-2.5 py-1 rounded-full">
                              {entry?.subject?.code || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-slate-700">
                            {showTeacherView
                              ? entry?.program?.name || "-"
                              : entry?.teacher?.name || "-"}
                          </td>
                          {!showRoomView && (
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {entry?.room?.name || "-"}
                            </td>
                          )}
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {parseDayRange(entry?.dayRange || null).map(
                                (day) => (
                                  <span
                                    key={day}
                                    className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm"
                                  >
                                    {day}
                                  </span>
                                )
                              )}
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
                {LECTURE_SLOTS.map((slot, index) => {
                  const entry = timetable?.find(
                    (e: any) => e.lectureSlot === slot
                  );
                  if (!entry?.subject) return null;

                  const colors = [
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                    "from-blue-600 to-blue-700",
                  ];

                  return (
                    <div
                      key={slot}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div
                        className={`mb-4 flex items-center gap-3 bg-linear-to-r ${
                          colors[index % colors.length]
                        } text-white p-3 rounded-xl shadow-md`}
                      >
                        <Clock className="h-5 w-5" />
                        <span className="font-bold text-sm">
                          {formatLectureSlot(slot)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-base font-bold text-slate-800">
                            {entry.subject?.name}
                          </p>
                          <p className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-md inline-block mt-2 shadow-sm">
                            {entry.subject?.code}
                          </p>
                        </div>
                        {showTeacherView
                          ? entry.program && (
                              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl">
                                <div className="bg-blue-600 p-2 rounded-lg shadow">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-slate-800">
                                  {entry.program.name}
                                </span>
                              </div>
                            )
                          : entry.teacher && (
                              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl">
                                <div className="bg-blue-600 p-2 rounded-lg shadow">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-slate-800">
                                  {entry.teacher.name}
                                </span>
                              </div>
                            )}
                        {!showRoomView && entry.room && (
                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl">
                            <div className="bg-blue-600 p-2 rounded-lg shadow">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-800">
                              {entry.room.name}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {parseDayRange(entry.dayRange).map((day) => (
                            <span
                              key={day}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md"
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
            </>
          )}
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
