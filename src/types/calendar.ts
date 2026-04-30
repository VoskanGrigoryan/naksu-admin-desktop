import type { ClassType } from "../store/usersStore";

export type CalendarEvent = {
  id?: string;
  title: string;
  classType?: ClassType;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startRecur: string;
  endRecur?: string;
  backgroundColor: string;
  borderColor: string;
  maxCapacity?: number;
  extendedProps?: {
    instructor: string;
  };
};
