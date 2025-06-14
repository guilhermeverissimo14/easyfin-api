import { z } from 'zod'

export const createUserSchema = z.object({
   name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
   email: z.string().email('Formato de e-mail inválido'),
   role: z.string(),
   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números').optional(),
   phone: z.string().optional(),
   cpfCnpj: z.string().optional(),
   birthdate: z.string().optional(),
})

export const updateUserSchema = z.object({
   name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
   email: z.string().email('Formato de e-mail inválido').optional(),
   role: z.string().optional(),
   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números').optional(),
   phone: z.string().optional().nullable(),
   cpfCnpj: z.string().optional(),
   birthdate: z.string().optional().nullable(),
   avatar: z.string().optional().nullable(),
})

export const updateUserPasswordSchema = z.object({
   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números'),
   newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números'),
})