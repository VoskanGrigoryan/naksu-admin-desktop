import { z } from "zod";

export const classTypeEnum = z.enum([
  "muay_thai",
  "sipalki_do",
  "competidores",
  "kick_boxing",
  "boxeo",
  "boxeo_comp_thai",
  "yoga",
]);

export const membershipItemSchema = z.object({
  classType: classTypeEnum,

  totalClasses: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor a 0"),

  amountPaid: z
    .number()
    .min(0, "No puede ser negativo"),

  pricePerClass: z
    .number()
    .min(0, "No puede ser negativo")
    .optional(),
});

export const membershipsSchema = z.object({
  memberships: z.array(membershipItemSchema),
});

export type MembershipFormValues = z.infer<typeof membershipsSchema>;
