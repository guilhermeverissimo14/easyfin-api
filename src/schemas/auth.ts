import { z } from 'zod'

export const loginSchema = z.object({
   email: z.string().email('Formato de e-mail inválido'),
   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números'),
})

export const forgotPasswordSchema = z.object({
   email: z.string().email('Formato de e-mail inválido'),
})

export const resetPasswordSchema = z.object({
   email: z.string().email('Formato de e-mail inválido'),
   code: z.string().length(6, 'Código de recuperação inválido'),
   newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres, incluindo letras e números'),
})

export const refreshTokenSchema = z.object({
   token: z.string().min(1, 'Token inválido'),
})

export const validateCodeSchema = z.object({
   email: z.string().email('Formato de e-mail inválido'),
   code: z.string().length(6, 'Código de recuperação inválido'),
})
