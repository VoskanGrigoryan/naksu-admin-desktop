import type z from "zod";
import type { eventSchema } from "../../schemas/eventSchema";
import type { CalendarEvent } from "../../types/calendar";
import { formatDate } from "../helpers/formatDate";

type FormValues = z.output<typeof eventSchema>;

export const mapEventToFormValues = (event: CalendarEvent): FormValues => ({
  activity: event.title,
  instructor: event.extendedProps?.instructor ?? "",
  startTime: event.startTime.slice(0, 5),
  endTime: event.endTime.slice(0, 5),
  daysOfWeek: event.daysOfWeek.map(String),
  startDate: new Date(event.startRecur),
  endDate: event.endRecur ? new Date(event.endRecur) : null,
  color: event.backgroundColor,
  maxCapacity: event.maxCapacity ?? null,
});

export const mapFormToEvent = (values: FormValues, id?: string): CalendarEvent => ({
  id,
  title: values.activity,
  daysOfWeek: values.daysOfWeek.map(Number),
  startTime: values.startTime + ":00",
  endTime: values.endTime + ":00",
  startRecur: formatDate(values.startDate),
  endRecur: values.endDate ? formatDate(values.endDate) : undefined,
  backgroundColor: values.color,
  borderColor: values.color,
  maxCapacity: values.maxCapacity ?? undefined,
  extendedProps: {
    instructor: values.instructor,
  },
});
