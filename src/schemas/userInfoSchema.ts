import { z } from "zod";

export const userInfoSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  birthday: z.date().nullable(),
  dni: z.string().optional(),
});

export type UserInfoFormValues = z.infer<typeof userInfoSchema>;
