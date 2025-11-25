"use client";

import { useQuery } from "@tanstack/react-query";

export interface Program {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableEntry {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  program: {
    id: string;
    name: string;
  } | null;
  subject: {
    id: string;
    name: string;
    code: string;
  } | null;
  teacher: {
    id: string;
    name: string;
  } | null;
  room: {
    id: string;
    name: string;
  } | null;
}

export function usePrograms() {
  return useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await fetch("/api/timetable/programs");
      if (!res.ok) throw new Error("Failed to fetch programs");
      return res.json();
    },
  });
}

export function useTeachers() {
  return useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch("/api/timetable/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      return res.json();
    },
  });
}

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/timetable/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
  });
}

export function useTimetableEntries() {
  return useQuery<TimetableEntry[]>({
    queryKey: ["timetable-entries"],
    queryFn: async () => {
      const res = await fetch("/api/timetable/entries");
      if (!res.ok) throw new Error("Failed to fetch timetable entries");
      return res.json();
    },
  });
}
