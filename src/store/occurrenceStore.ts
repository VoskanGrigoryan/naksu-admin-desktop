import { create } from "zustand";
import type { ClassType } from "./usersStore";
import { useUsersStore } from "./usersStore";
import { useCalendarStore } from "./calendarStore";

export type ClassOccurrence = {
  id: string;
  eventId: string;
  date: string; // YYYY-MM-DD
  attendees: string[]; // user IDs
  cancelled: boolean;
};

type OccurrenceState = {
  occurrences: ClassOccurrence[];
  setOccurrences: (occurrences: ClassOccurrence[]) => void;
  getOccurrence: (eventId: string, date: string) => ClassOccurrence | undefined;
  upsertAttendees: (eventId: string, date: string, newAttendees: string[]) => void;
  cancelOccurrence: (eventId: string, date: string) => void;
  restoreOccurrence: (eventId: string, date: string) => void;
};

export const useOccurrenceStore = create<OccurrenceState>((set, get) => ({
  occurrences: [],

  setOccurrences: (occurrences) => set({ occurrences }),

  getOccurrence: (eventId, date) =>
    get().occurrences.find((o) => o.eventId === eventId && o.date === date),

  upsertAttendees: (eventId, date, newAttendees) => {
    const prev = get().getOccurrence(eventId, date);
    const prevSet = new Set(prev?.attendees ?? []);
    const newSet = new Set(newAttendees);

    const added = newAttendees.filter((id) => !prevSet.has(id));
    const removed = [...prevSet].filter((id) => !newSet.has(id));

    // Resolve classType from the event to update classesUsed
    const event = useCalendarStore.getState().events.find((e) => e.id === eventId);
    const classType: ClassType | undefined = event?.classType;

    if (classType) {
      const usersStore = useUsersStore.getState();
      added.forEach((uid) => usersStore.incrementClassesUsed(uid, classType));
      removed.forEach((uid) => usersStore.decrementClassesUsed(uid, classType));
    }

    set((state) => {
      const exists = state.occurrences.some(
        (o) => o.eventId === eventId && o.date === date,
      );
      if (exists) {
        return {
          occurrences: state.occurrences.map((o) =>
            o.eventId === eventId && o.date === date
              ? { ...o, attendees: newAttendees }
              : o,
          ),
        };
      }
      return {
        occurrences: [
          ...state.occurrences,
          {
            id: crypto.randomUUID(),
            eventId,
            date,
            attendees: newAttendees,
            cancelled: false,
          },
        ],
      };
    });
  },

  cancelOccurrence: (eventId, date) =>
    set((state) => {
      const exists = state.occurrences.some(
        (o) => o.eventId === eventId && o.date === date,
      );
      if (exists) {
        return {
          occurrences: state.occurrences.map((o) =>
            o.eventId === eventId && o.date === date
              ? { ...o, cancelled: true }
              : o,
          ),
        };
      }
      return {
        occurrences: [
          ...state.occurrences,
          {
            id: crypto.randomUUID(),
            eventId,
            date,
            attendees: [],
            cancelled: true,
          },
        ],
      };
    }),

  restoreOccurrence: (eventId, date) =>
    set((state) => ({
      occurrences: state.occurrences.map((o) =>
        o.eventId === eventId && o.date === date ? { ...o, cancelled: false } : o,
      ),
    })),
}));
