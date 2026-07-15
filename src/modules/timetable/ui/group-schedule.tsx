import { cn } from "@/lib/utils";
import {
  type GroupId,
  getDayScopes,
  getSessionVisual,
  type SessionScope,
  type TimetableEntryLike,
} from "@/modules/timetable/utils/group-schedule";

export function GroupLegend({ groups }: { groups: GroupId[] }) {
  const scopes: SessionScope[] = [
    { kind: "combined", group: null },
    ...groups.map((group) => ({ kind: "group" as const, group })),
  ];

  return (
    <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <legend className="text-xs font-bold uppercase tracking-wide text-slate-600">
        Class key
      </legend>
      {scopes.map((scope) => {
        const visual = getSessionVisual(scope);
        return (
          <span
            key={visual.label}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
          >
            <span
              className={cn("h-3 w-3 rounded-full", visual.markerClassName)}
            />
            {visual.label}
          </span>
        );
      })}
    </fieldset>
  );
}

export function AttendancePills({ entry }: { entry: TimetableEntryLike }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {getDayScopes(entry).map(({ day, scope }) => {
        const visual = getSessionVisual(scope);
        const label = scope.kind === "group" ? `${scope.group} · ${day}` : day;

        return (
          <span
            key={`${day}-${visual.label}`}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm",
              visual.badgeClassName,
            )}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
