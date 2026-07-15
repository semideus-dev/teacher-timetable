export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type Day = (typeof DAYS)[number];

export const LECTURE_SLOTS = [
  "lect-1_(9:00-9:45)",
  "lect-2_(9:45-10:30)",
  "lect-3_(10:30-11:15)",
  "lect-4_(11:15-12:00)",
  "lect-5_(12:00-12:45)",
  "lect-6_(12:45-1:30)",
  "lect-7_(1:30-2:15)",
  "lect-8_(2:15-3:00)",
] as const;

export type GroupId = `G${number}`;

export type SessionScope =
  | { kind: "combined"; group: null }
  | { kind: "group"; group: GroupId };

export interface TimetableEntryLike {
  id: string;
  lectureSlot: string;
  dayRange: string | null;
  subject?: { name: string } | null;
}

export interface DayAssignment {
  day: Day;
  group: GroupId | null;
}

export interface SlotDaySession<T extends TimetableEntryLike> {
  entry: T;
  scope: SessionScope;
}

const GROUPED_RANGE_PATTERN =
  /(?:\b(G\d+)\s*)?\((\d+)\s*-\s*(\d+)\)(?:\s*(G\d+)(?!\s*\())?/gi;

function normalizeGroup(group: string | undefined): GroupId | null {
  if (!group) return null;
  return group.toUpperCase() as GroupId;
}

function allDaysAsCombined(): DayAssignment[] {
  return DAYS.map((day) => ({ day, group: null }));
}

function getExplicitGroupAssignments(value: string | null): DayAssignment[] {
  if (!value?.trim()) return [];

  const assignments: DayAssignment[] = [];

  for (const match of value.matchAll(GROUPED_RANGE_PATTERN)) {
    const group = normalizeGroup(match[1]) ?? normalizeGroup(match[4]);
    if (!group) continue;

    const start = Number.parseInt(match[2] ?? "", 10);
    const end = Number.parseInt(match[3] ?? "", 10);
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) continue;

    for (
      let dayIndex = Math.max(start, 1);
      dayIndex <= Math.min(end, DAYS.length);
      dayIndex++
    ) {
      const day = DAYS[dayIndex - 1];
      if (day) assignments.push({ day, group });
    }
  }

  return assignments;
}

function getVisibleGroups(
  subjectName: string | null | undefined,
): Set<GroupId> {
  const groups = new Set<GroupId>();

  for (const match of subjectName?.matchAll(/\b(G\d+)\b/gi) ?? []) {
    const group = normalizeGroup(match[1]);
    if (group) groups.add(group);
  }

  return groups;
}

/**
 * Group labels are schedule metadata. Keep them available to the resolver,
 * but omit them from the public-facing course name.
 */
export function getDisplaySubjectName(subjectName: string): string {
  return subjectName
    .replace(/\s*G\d+\s*(?:\(\s*\d+\s*-\s*\d+\s*\))?\s*(?:,\s*)?/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[\s,;/]+$/g, "")
    .trim();
}

/**
 * Parses the legacy day-range format without changing the persisted value.
 * Bare ranges are combined classes; a G<number> immediately before or after a
 * range identifies that group's attendance for those days.
 */
export function parseDayAssignments(dayRange: string | null): DayAssignment[] {
  if (!dayRange?.trim()) return allDaysAsCombined();

  const assignments: DayAssignment[] = [];

  for (const match of dayRange.matchAll(GROUPED_RANGE_PATTERN)) {
    const start = Number.parseInt(match[2] ?? "", 10);
    const end = Number.parseInt(match[3] ?? "", 10);

    if (Number.isNaN(start) || Number.isNaN(end) || start > end) continue;

    const group = normalizeGroup(match[1]) ?? normalizeGroup(match[4]);
    for (
      let dayIndex = Math.max(start, 1);
      dayIndex <= Math.min(end, DAYS.length);
      dayIndex++
    ) {
      const day = DAYS[dayIndex - 1];
      if (day) assignments.push({ day, group });
    }
  }

  return assignments.length > 0 ? assignments : allDaysAsCombined();
}

export function getEntryScopeForDay(
  entry: TimetableEntryLike,
  day: Day,
): SessionScope | null {
  const scheduleAssignments = parseDayAssignments(entry.dayRange).filter(
    (assignment) => assignment.day === day,
  );

  if (scheduleAssignments.length === 0) return null;

  const visibleGroups = getVisibleGroups(entry.subject?.name);
  if (visibleGroups.size === 0) return { kind: "combined", group: null };

  const scheduleGroups = new Set(
    scheduleAssignments.flatMap((assignment) =>
      assignment.group ? [assignment.group] : [],
    ),
  );
  const hasExplicitScheduleGroup = scheduleGroups.size > 0;
  const scheduleGroup =
    scheduleAssignments.some((assignment) => assignment.group === null) ||
    scheduleGroups.size !== 1
      ? null
      : [...scheduleGroups][0];

  const titleGroupsForDay = new Set(
    getExplicitGroupAssignments(entry.subject?.name ?? null)
      .filter((assignment) => assignment.day === day)
      .map((assignment) => assignment.group)
      .filter((group): group is GroupId => group !== null),
  );

  const titleGroup =
    titleGroupsForDay.size === 1 ? [...titleGroupsForDay][0] : null;

  if (titleGroup) {
    if (hasExplicitScheduleGroup && scheduleGroup !== titleGroup) {
      return { kind: "combined", group: null };
    }
    return { kind: "group", group: titleGroup };
  }

  if (titleGroupsForDay.size > 1) {
    return { kind: "combined", group: null };
  }

  if (visibleGroups.size === 1) {
    const [visibleGroup] = visibleGroups;
    if (hasExplicitScheduleGroup && scheduleGroup !== visibleGroup) {
      return { kind: "combined", group: null };
    }
    return { kind: "group", group: visibleGroup };
  }

  if (!scheduleGroup || !visibleGroups.has(scheduleGroup)) {
    return { kind: "combined", group: null };
  }

  return { kind: "group", group: scheduleGroup };
}

export function getSlotDaySessions<T extends TimetableEntryLike>(
  entries: T[],
  lectureSlot: string,
  day: Day,
): SlotDaySession<T>[] {
  return entries
    .flatMap((entry) => {
      if (entry.lectureSlot !== lectureSlot) return [];
      const scope = getEntryScopeForDay(entry, day);
      return scope ? [{ entry, scope }] : [];
    })
    .sort((first, second) => {
      if (first.scope.kind !== second.scope.kind) {
        return first.scope.kind === "combined" ? -1 : 1;
      }

      const firstGroup = first.scope.group ?? "G0";
      const secondGroup = second.scope.group ?? "G0";
      const groupOrder =
        Number.parseInt(firstGroup.slice(1), 10) -
        Number.parseInt(secondGroup.slice(1), 10);

      return groupOrder || first.entry.id.localeCompare(second.entry.id);
    });
}

export function getDayScopes(entry: TimetableEntryLike): Array<{
  day: Day;
  scope: SessionScope;
}> {
  return DAYS.flatMap((day) => {
    const scope = getEntryScopeForDay(entry, day);
    return scope ? [{ day, scope }] : [];
  });
}

export function getLegendGroups(entries: TimetableEntryLike[]): GroupId[] {
  const groups = new Set<GroupId>();

  for (const entry of entries) {
    for (const { scope } of getDayScopes(entry)) {
      if (scope.kind === "group") groups.add(scope.group);
    }
  }

  return [...groups].sort(
    (first, second) =>
      Number.parseInt(first.slice(1), 10) -
      Number.parseInt(second.slice(1), 10),
  );
}

export interface SessionVisual {
  label: string;
  cardClassName: string;
  borderClassName: string;
  accentClassName: string;
  badgeClassName: string;
  iconClassName: string;
  markerClassName: string;
}

const GROUP_VISUALS: Omit<SessionVisual, "label">[] = [
  {
    cardClassName: "bg-linear-to-br from-amber-50 to-amber-100",
    borderClassName: "border-amber-200",
    accentClassName: "bg-amber-500",
    badgeClassName: "bg-amber-600 text-white",
    iconClassName: "bg-amber-600",
    markerClassName: "bg-amber-500",
  },
  {
    cardClassName: "bg-linear-to-br from-violet-50 to-violet-100",
    borderClassName: "border-violet-200",
    accentClassName: "bg-violet-500",
    badgeClassName: "bg-violet-600 text-white",
    iconClassName: "bg-violet-600",
    markerClassName: "bg-violet-500",
  },
  {
    cardClassName: "bg-linear-to-br from-emerald-50 to-emerald-100",
    borderClassName: "border-emerald-200",
    accentClassName: "bg-emerald-500",
    badgeClassName: "bg-emerald-600 text-white",
    iconClassName: "bg-emerald-600",
    markerClassName: "bg-emerald-500",
  },
  {
    cardClassName: "bg-linear-to-br from-rose-50 to-rose-100",
    borderClassName: "border-rose-200",
    accentClassName: "bg-rose-500",
    badgeClassName: "bg-rose-600 text-white",
    iconClassName: "bg-rose-600",
    markerClassName: "bg-rose-500",
  },
  {
    cardClassName: "bg-linear-to-br from-cyan-50 to-cyan-100",
    borderClassName: "border-cyan-200",
    accentClassName: "bg-cyan-500",
    badgeClassName: "bg-cyan-600 text-white",
    iconClassName: "bg-cyan-600",
    markerClassName: "bg-cyan-500",
  },
  {
    cardClassName: "bg-linear-to-br from-fuchsia-50 to-fuchsia-100",
    borderClassName: "border-fuchsia-200",
    accentClassName: "bg-fuchsia-500",
    badgeClassName: "bg-fuchsia-600 text-white",
    iconClassName: "bg-fuchsia-600",
    markerClassName: "bg-fuchsia-500",
  },
];

const COMBINED_VISUAL: SessionVisual = {
  label: "Combined",
  cardClassName: "bg-linear-to-br from-blue-50 to-blue-100",
  borderClassName: "border-blue-200",
  accentClassName: "bg-blue-600",
  badgeClassName: "bg-blue-600 text-white",
  iconClassName: "bg-blue-600",
  markerClassName: "bg-blue-600",
};

export function getSessionVisual(scope: SessionScope): SessionVisual {
  if (scope.kind === "combined") return COMBINED_VISUAL;

  const groupNumber = Number.parseInt(scope.group.slice(1), 10);
  const visual = GROUP_VISUALS[(groupNumber - 1) % GROUP_VISUALS.length];

  return { ...visual, label: scope.group };
}
