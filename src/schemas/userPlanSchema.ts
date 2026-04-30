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

export const membershipItemSchema = z
  .object({
    classType: classTypeEnum,
    membershipType: z.enum(["monthly", "class_pack"]).default("class_pack"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    amountPaid: z.number().min(0, "No puede ser negativo"),
    totalClasses: z.number().int("Debe ser entero").min(0).default(0),
    classesUsed: z.number().int().min(0).default(0),
    pricePerClass: z.number().min(0).optional(),
    monthlyPrice: z.number().min(0).optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "La fecha fin debe ser posterior al inicio",
    path: ["endDate"],
  });

export const membershipsSchema = z.object({
  memberships: z.array(membershipItemSchema),
});

export type MembershipFormValues = z.infer<typeof membershipsSchema>;
