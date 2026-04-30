import { z } from "zod";

export const eventSchema = z
  .object({
    activity: z.string().trim().min(1, "La actividad es obligatoria"),
    instructor: z.string().trim().min(1, "El instructor es obligatorio"),
    startTime: z.string().min(1, "Hora inicio obligatoria"),
    endTime: z.string().min(1, "Hora fin obligatoria"),
    daysOfWeek: z.array(z.string()).min(1, "Seleccione al menos un día"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    color: z.string().min(1),
    maxCapacity: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "La hora fin debe ser mayor a la hora inicio",
    path: ["endTime"],
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "La fecha fin no puede ser menor a la fecha inicio",
    path: ["endDate"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;
