import assert from "node:assert/strict";
import test from "node:test";
import {
  getDisplaySubjectName,
  getEntryScopeForDay,
  getSlotDaySessions,
  parseDayAssignments,
} from "./group-schedule";

test("removes group metadata from public subject names", () => {
  assert.equal(
    getDisplaySubjectName(
      "Lab based on Introduction to Programming G1(1-3), G2(4-6)",
    ),
    "Lab based on Introduction to Programming",
  );
  assert.equal(
    getDisplaySubjectName("Lab based on Ethical Hacking G1, G2"),
    "Lab based on Ethical Hacking",
  );
});

test("parses combined, prefixed, suffixed, and chained group ranges", () => {
  assert.deepEqual(parseDayAssignments("(1-2)"), [
    { day: "Mon", group: null },
    { day: "Tue", group: null },
  ]);
  assert.deepEqual(parseDayAssignments("G1(1-3)G2(4-6)"), [
    { day: "Mon", group: "G1" },
    { day: "Tue", group: "G1" },
    { day: "Wed", group: "G1" },
    { day: "Thu", group: "G2" },
    { day: "Fri", group: "G2" },
    { day: "Sat", group: "G2" },
  ]);
  assert.deepEqual(parseDayAssignments("(1-3)G1/G2(4-6)"), [
    { day: "Mon", group: "G1" },
    { day: "Tue", group: "G1" },
    { day: "Wed", group: "G1" },
    { day: "Thu", group: "G2" },
    { day: "Fri", group: "G2" },
    { day: "Sat", group: "G2" },
  ]);
});

test("keeps malformed or missing ranges visible as combined sessions", () => {
  assert.deepEqual(parseDayAssignments("not a day range"), [
    { day: "Mon", group: null },
    { day: "Tue", group: null },
    { day: "Wed", group: null },
    { day: "Thu", group: null },
    { day: "Fri", group: null },
    { day: "Sat", group: null },
  ]);
  assert.deepEqual(parseDayAssignments(null), parseDayAssignments(""));
});

test("keeps an unlabeled class combined despite grouped day-range metadata", () => {
  assert.deepEqual(
    getEntryScopeForDay(
      {
        id: "unlabeled",
        lectureSlot: "lect-1_(9:00-9:45)",
        dayRange: "G1(1-3)G2(4-6)",
        subject: { name: "Introduction to the Internet" },
      },
      "Mon",
    ),
    {
      kind: "combined",
      group: null,
    },
  );
});

test("uses explicit title group/day mappings when the stored range is shared", () => {
  const python = {
    id: "python",
    lectureSlot: "lect-8_(2:15-3:00)",
    dayRange: "(1-6)",
    subject: {
      name: "Lab based on Introduction to Programming G1(1-3), G2(4-6)",
    },
  };

  assert.deepEqual(getEntryScopeForDay(python, "Mon"), {
    kind: "group",
    group: "G1",
  });
  assert.deepEqual(getEntryScopeForDay(python, "Thu"), {
    kind: "group",
    group: "G2",
  });
});

test("keeps an unranged visible group pair combined", () => {
  assert.deepEqual(
    getEntryScopeForDay(
      {
        id: "ambiguous-pair",
        lectureSlot: "lect-4_(11:15-12:00)",
        dayRange: "(1-6)",
        subject: { name: "Lab based on Ethical Hacking G1, G2" },
      },
      "Mon",
    ),
    {
      kind: "combined",
      group: null,
    },
  );
});

test("uses grouped day-range metadata only when a visible pair supports it", () => {
  const entry = {
    id: "supported-pair",
    lectureSlot: "lect-4_(11:15-12:00)",
    dayRange: "G2(1-3)G1(4-6)",
    subject: { name: "Lab based on Computer Fundamentals G1, G2" },
  };

  assert.deepEqual(getEntryScopeForDay(entry, "Mon"), {
    kind: "group",
    group: "G2",
  });
  assert.deepEqual(getEntryScopeForDay(entry, "Thu"), {
    kind: "group",
    group: "G1",
  });
});

test("keeps conflicting title and day-range assignments combined", () => {
  assert.deepEqual(
    getEntryScopeForDay(
      {
        id: "conflict",
        lectureSlot: "lect-4_(11:15-12:00)",
        dayRange: "G2(1-3)G1(4-6)",
        subject: {
          name: "Lab based on Computer Fundamentals G1(1-3), G2(4-6)",
        },
      },
      "Mon",
    ),
    {
      kind: "combined",
      group: null,
    },
  );
});

test("keeps a shared G1 and G2 entry as one combined session", () => {
  assert.deepEqual(
    getEntryScopeForDay(
      {
        id: "shared",
        lectureSlot: "lect-1_(9:00-9:45)",
        dayRange: "G1(1-3)G2(1-3)",
        subject: { name: "Shared lab G1, G2" },
      },
      "Mon",
    ),
    {
      kind: "combined",
      group: null,
    },
  );
});

test("uses per-entry labels when same-code labs have different groups", () => {
  const entries = [
    {
      id: "data-structures-g1",
      lectureSlot: "lect-6_(12:45-1:30)",
      dayRange: "(4-6)",
      subjectLabel: "LAB BASED ON DATA STRUCTURES G1(4-6)",
      subject: { name: "LAB BASED ON DATA STRUCTURES" },
    },
    {
      id: "data-structures-g2",
      lectureSlot: "lect-6_(12:45-1:30)",
      dayRange: "(4-6)",
      subjectLabel: "LAB BASED ON DATA STRUCTURES G2(4-6)",
      subject: { name: "LAB BASED ON DATA STRUCTURES" },
    },
  ];

  assert.deepEqual(
    getSlotDaySessions(entries, "lect-6_(12:45-1:30)", "Mon"),
    [],
  );
  assert.deepEqual(
    getSlotDaySessions(entries, "lect-6_(12:45-1:30)", "Thu").map(
      ({ entry, scope }) => [entry.id, scope],
    ),
    [
      ["data-structures-g1", { kind: "group", group: "G1" }],
      ["data-structures-g2", { kind: "group", group: "G2" }],
    ],
  );
  assert.equal(
    getDisplaySubjectName(entries[0]?.subjectLabel ?? ""),
    "LAB BASED ON DATA STRUCTURES",
  );
});

test("returns both concurrent group classes and swaps their scopes by day", () => {
  const entries = [
    {
      id: "python",
      lectureSlot: "lect-8_(2:15-3:00)",
      dayRange: "G1(1-3)G2(4-6)",
      subject: { name: "Python lab G1, G2" },
    },
    {
      id: "fundamentals",
      lectureSlot: "lect-8_(2:15-3:00)",
      dayRange: "G2(1-3)G1(4-6)",
      subject: { name: "Computer Fundamentals G1, G2" },
    },
  ];

  assert.deepEqual(
    getSlotDaySessions(entries, "lect-8_(2:15-3:00)", "Mon").map(
      ({ entry, scope }) => [entry.id, scope],
    ),
    [
      ["python", { kind: "group", group: "G1" }],
      ["fundamentals", { kind: "group", group: "G2" }],
    ],
  );
  assert.deepEqual(
    getSlotDaySessions(entries, "lect-8_(2:15-3:00)", "Thu").map(
      ({ entry, scope }) => [entry.id, scope],
    ),
    [
      ["fundamentals", { kind: "group", group: "G1" }],
      ["python", { kind: "group", group: "G2" }],
    ],
  );
});
