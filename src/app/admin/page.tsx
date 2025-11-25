"use client";

import { Navbar } from "@/components/navbar";
import {
  usePrograms,
  useTeachers,
  useRooms,
  useTimetableEntries,
} from "@/modules/timetable/hooks/use-timetable";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: teachers } = useTeachers();
  const { data: rooms } = useRooms();
  const { data: entries } = useTimetableEntries();

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [newTeacher, setNewTeacher] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [editingEntries, setEditingEntries] = useState<Record<string, any>>({});

  // Teacher mutations
  const addTeacherMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add teacher");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher added successfully");
      setNewTeacher("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/teachers?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete teacher");
    },
  });

  // Room mutations
  const addRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add room");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room added successfully");
      setNewRoom("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/rooms?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete room");
    },
  });

  // Program mutations
  const addProgramMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add program");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program added successfully");
      setNewProgram("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/programs?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete program");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete program");
    },
  });

  // Timetable entry mutations
  const updateEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/timetable", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
    },
    onError: () => {
      toast.error("Failed to update timetable");
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
    },
    onError: () => {
      toast.error("Failed to create timetable entry");
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/timetable?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
      toast.success("Entry deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete entry");
    },
  });

  if (programsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  const programEntries = entries?.filter(
    (e) => e.program?.id === selectedProgram
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Manage timetable entries and data</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Program to Edit
            </label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {programs?.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "default" : "outline"}
              className={
                editMode
                  ? "bg-blue-900 hover:bg-blue-800"
                  : "border-blue-900 text-blue-900 hover:bg-blue-50"
              }
            >
              {editMode ? "View Mode" : "Edit Mode"}
            </Button>
          </div>
        </div>

        {!selectedProgram ? (
          <div className="text-center py-12 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600">Select a program to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage Teachers
                </h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Add new teacher"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTeacher.trim()) {
                        addTeacherMutation.mutate(newTeacher);
                      }
                    }}
                  />
                  <Button
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    onClick={() => {
                      if (newTeacher.trim()) {
                        addTeacherMutation.mutate(newTeacher);
                      }
                    }}
                    disabled={addTeacherMutation.isPending}
                  >
                    {addTeacherMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Teacher"
                    )}
                  </Button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {teachers?.slice(0, 10).map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50"
                    >
                      <span>{teacher.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteTeacherMutation.mutate(teacher.id)}
                        disabled={deleteTeacherMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage Rooms
                </h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Add new room"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newRoom.trim()) {
                        addRoomMutation.mutate(newRoom);
                      }
                    }}
                  />
                  <Button
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    onClick={() => {
                      if (newRoom.trim()) {
                        addRoomMutation.mutate(newRoom);
                      }
                    }}
                    disabled={addRoomMutation.isPending}
                  >
                    {addRoomMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Room"
                    )}
                  </Button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {rooms?.slice(0, 10).map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50"
                    >
                      <span>{room.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteRoomMutation.mutate(room.id)}
                        disabled={deleteRoomMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage Programs
                </h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Add new program"
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newProgram.trim()) {
                        addProgramMutation.mutate(newProgram);
                      }
                    }}
                  />
                  <Button
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    onClick={() => {
                      if (newProgram.trim()) {
                        addProgramMutation.mutate(newProgram);
                      }
                    }}
                    disabled={addProgramMutation.isPending}
                  >
                    {addProgramMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Program"
                    )}
                  </Button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {programs?.slice(0, 10).map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50"
                    >
                      <span className="truncate">{program.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteProgramMutation.mutate(program.id)}
                        disabled={deleteProgramMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timetable Editor */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Timetable Editor
                </h3>
                <Button
                  className="bg-blue-900 hover:bg-blue-800"
                  onClick={async () => {
                    const updates = Object.entries(editingEntries);
                    if (updates.length === 0) {
                      toast.info("No changes to save");
                      return;
                    }

                    try {
                      for (const [slot, editedEntry] of updates) {
                        const existingEntry = programEntries?.find(
                          (e) => e.lectureSlot === slot
                        );

                        if (existingEntry?.id) {
                          // Update existing entry
                          await updateEntryMutation.mutateAsync(editedEntry);
                        } else {
                          // Create new entry
                          await createEntryMutation.mutateAsync({
                            ...editedEntry,
                            programId: selectedProgram,
                            lectureSlot: slot,
                          });
                        }
                      }
                      setEditingEntries({});
                      toast.success("Timetable updated successfully");
                    } catch (error) {
                      // Error toasts are handled in mutations
                    }
                  }}
                  disabled={
                    updateEntryMutation.isPending ||
                    createEntryMutation.isPending ||
                    Object.keys(editingEntries).length === 0
                  }
                >
                  {updateEntryMutation.isPending ||
                  createEntryMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Time Slot
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        Subject
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
                      {editMode && (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {LECTURE_SLOTS.map((slot) => {
                      const entry = programEntries?.find(
                        (e) => e.lectureSlot === slot
                      );
                      return (
                        <tr key={slot} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {slot}
                          </td>
                          <td className="px-4 py-3">
                            {editMode ? (
                              <div className="space-y-1">
                                <Input
                                  placeholder="Subject name"
                                  defaultValue={entry?.subject?.name || ""}
                                  className="h-8 text-sm"
                                  onChange={(e) => {
                                    setEditingEntries((prev) => ({
                                      ...prev,
                                      [slot]: {
                                        ...prev[slot],
                                        id: entry?.id,
                                        subjectName: e.target.value,
                                        subjectCode:
                                          prev[slot]?.subjectCode ||
                                          entry?.subject?.code ||
                                          "",
                                        teacherId:
                                          prev[slot]?.teacherId ||
                                          entry?.teacher?.id,
                                        roomId:
                                          prev[slot]?.roomId || entry?.room?.id,
                                        dayRange:
                                          prev[slot]?.dayRange ||
                                          entry?.dayRange ||
                                          "",
                                      },
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Subject code"
                                  defaultValue={entry?.subject?.code || ""}
                                  className="h-8 text-sm"
                                  onChange={(e) => {
                                    setEditingEntries((prev) => ({
                                      ...prev,
                                      [slot]: {
                                        ...prev[slot],
                                        id: entry?.id,
                                        subjectCode: e.target.value,
                                        subjectName:
                                          prev[slot]?.subjectName ||
                                          entry?.subject?.name ||
                                          "",
                                        teacherId:
                                          prev[slot]?.teacherId ||
                                          entry?.teacher?.id,
                                        roomId:
                                          prev[slot]?.roomId || entry?.room?.id,
                                        dayRange:
                                          prev[slot]?.dayRange ||
                                          entry?.dayRange ||
                                          "",
                                      },
                                    }));
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="text-sm">
                                <div className="text-slate-900 font-medium">
                                  {entry?.subject?.name || "-"}
                                </div>
                                {entry?.subject?.code && (
                                  <div className="text-slate-600 text-xs">
                                    {entry.subject.code}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editMode ? (
                              <Select
                                defaultValue={entry?.teacher?.id}
                                onValueChange={(value) => {
                                  setEditingEntries((prev) => {
                                    const currentEntry = prev[slot] || {};
                                    return {
                                      ...prev,
                                      [slot]: {
                                        ...currentEntry,
                                        id: entry?.id,
                                        teacherId: value,
                                        subjectName:
                                          currentEntry.subjectName ||
                                          entry?.subject?.name ||
                                          "",
                                        subjectCode:
                                          currentEntry.subjectCode ||
                                          entry?.subject?.code ||
                                          "",
                                        roomId:
                                          currentEntry.roomId ||
                                          entry?.room?.id,
                                        dayRange:
                                          currentEntry.dayRange ||
                                          entry?.dayRange ||
                                          "",
                                      },
                                    };
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers?.map((teacher) => (
                                    <SelectItem
                                      key={teacher.id}
                                      value={teacher.id}
                                    >
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-slate-900">
                                {entry?.teacher?.name || "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editMode ? (
                              <Select
                                defaultValue={entry?.room?.id}
                                onValueChange={(value) => {
                                  setEditingEntries((prev) => {
                                    const currentEntry = prev[slot] || {};
                                    return {
                                      ...prev,
                                      [slot]: {
                                        ...currentEntry,
                                        id: entry?.id,
                                        roomId: value,
                                        subjectName:
                                          currentEntry.subjectName ||
                                          entry?.subject?.name ||
                                          "",
                                        subjectCode:
                                          currentEntry.subjectCode ||
                                          entry?.subject?.code ||
                                          "",
                                        teacherId:
                                          currentEntry.teacherId ||
                                          entry?.teacher?.id,
                                        dayRange:
                                          currentEntry.dayRange ||
                                          entry?.dayRange ||
                                          "",
                                      },
                                    };
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rooms?.map((room) => (
                                    <SelectItem key={room.id} value={room.id}>
                                      {room.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-slate-900">
                                {entry?.room?.name || "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editMode ? (
                              <Input
                                placeholder="(1-6)"
                                defaultValue={entry?.dayRange || ""}
                                className="h-8 text-sm w-20"
                                onChange={(e) => {
                                  setEditingEntries((prev) => {
                                    const currentEntry = prev[slot] || {};
                                    return {
                                      ...prev,
                                      [slot]: {
                                        ...currentEntry,
                                        id: entry?.id,
                                        dayRange: e.target.value,
                                        subjectName:
                                          currentEntry.subjectName ||
                                          entry?.subject?.name ||
                                          "",
                                        subjectCode:
                                          currentEntry.subjectCode ||
                                          entry?.subject?.code ||
                                          "",
                                        teacherId:
                                          currentEntry.teacherId ||
                                          entry?.teacher?.id,
                                        roomId:
                                          currentEntry.roomId ||
                                          entry?.room?.id,
                                      },
                                    };
                                  });
                                }}
                              />
                            ) : (
                              <span className="text-sm text-slate-900">
                                {entry?.dayRange || "-"}
                              </span>
                            )}
                          </td>
                          {editMode && (
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  if (entry?.id) {
                                    deleteEntryMutation.mutate(entry.id);
                                  }
                                }}
                                disabled={deleteEntryMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
