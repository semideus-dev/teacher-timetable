"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FilterBarProps {
  teachers: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string }>;
  programs: Array<{ id: string; name: string }>;
  onSearchChange: (value: string) => void;
  onTeacherChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  selectedTeacher?: string;
  selectedRoom?: string;
  selectedProgram?: string;
}

export function FilterBar({
  teachers,
  rooms,
  programs,
  onSearchChange,
  onTeacherChange,
  onRoomChange,
  onProgramChange,
  selectedTeacher,
  selectedRoom,
  selectedProgram,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search programs, teachers, subjects..."
            className="pl-11 h-12 rounded-xl border-slate-300 focus:border-blue-400 focus:ring-blue-400/20"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-6 rounded-xl border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 font-semibold transition-all"
        >
          <SlidersHorizontal className="mr-2 h-5 w-5" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Teacher-wise Timetable
            </label>
            <Select value={selectedTeacher} onValueChange={onTeacherChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300 focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Room-wise Timetable
            </label>
            <Select value={selectedRoom} onValueChange={onRoomChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300 focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Select Room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Class-wise Timetable
            </label>
            <Select value={selectedProgram} onValueChange={onProgramChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300 focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
