"use client";

import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { Program } from "@/modules/timetable/hooks/use-timetable";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link href={`/timetable/${program.id}`}>
      <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-blue-400 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {program.name}
            </h3>
          </div>
          <div className="rounded-xl bg-blue-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
            <Calendar className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 bg-slate-50 group-hover:bg-blue-50 transition-colors px-4 py-3 rounded-xl">
          <div className="bg-blue-600 p-2 rounded-lg shadow">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-700 group-hover:text-blue-700">
            View Timetable
          </span>
        </div>
      </div>
    </Link>
  );
}
