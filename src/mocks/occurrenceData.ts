import type { ClassOccurrence } from "../store/occurrenceStore";

// Seeded attendance for recent classes (relative to 2026-04-30)
export const mockOccurrences: ClassOccurrence[] = [
  // Muay Thai Mon 2026-04-28
  { id: "occ-001", eventId: "ev-001", date: "2026-04-28", attendees: ["u-003", "u-005"], cancelled: false },
  // Kick Boxing Mon 2026-04-28
  { id: "occ-002", eventId: "ev-004", date: "2026-04-28", attendees: ["u-003", "u-009"], cancelled: false },
  // Boxeo Tue 2026-04-29
  { id: "occ-003", eventId: "ev-002", date: "2026-04-29", attendees: ["u-001", "u-006", "u-007"], cancelled: false },
  // Muay Thai Wed 2026-04-30 (today, no attendance yet)
  { id: "occ-004", eventId: "ev-001", date: "2026-04-30", attendees: [], cancelled: false },
  // Yoga Sat 2026-04-26
  { id: "occ-005", eventId: "ev-003", date: "2026-04-26", attendees: ["u-006", "u-010"], cancelled: false },
  // Muay Thai Mon 2026-04-21
  { id: "occ-006", eventId: "ev-001", date: "2026-04-21", attendees: ["u-003", "u-005"], cancelled: false },
  // Boxeo Thu 2026-04-24
  { id: "occ-007", eventId: "ev-002", date: "2026-04-24", attendees: ["u-001", "u-006"], cancelled: false },
  // Kick Boxing Thu 2026-04-24
  { id: "occ-008", eventId: "ev-004", date: "2026-04-24", attendees: ["u-003"], cancelled: false },
];
