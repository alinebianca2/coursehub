import { z } from "zod";
import { ROLES } from "../types/role";

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Za-z]/, "Senha deve conter ao menos uma letra")
  .regex(/[0-9]/, "Senha deve conter ao menos um número");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: passwordSchema,
  role: z.enum(ROLES),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
    email: z.string().email("E-mail inválido").optional(),
    password: passwordSchema.optional(),
    role: z.enum(ROLES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive("id inválido"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
