import { z } from 'zod'

export const createBankAccountSchema = z.object({
   bank: z.string().min(3, 'Banco deve ter pelo menos 3 caracteres'),
   agency: z.string().min(1, 'Agência deve ter pelo menos 3 caracteres').max(30, 'Agência deve ter no máximo 10 caracteres'),
   account: z.string().min(1, 'Conta deve ter pelo menos 3 caracteres').max(30, 'Conta deve ter no máximo 10 caracteres'),
   type: z.enum(['C', 'P'], {
      errorMap: () => ({ message: 'Tipo deve ser "C" ou "P"' }),
   }),
})

export const updateBankAccountSchema = z.object({
   bank: z.string().min(3, 'Banco deve ter pelo menos 3 caracteres').optional(),
   agency: z.string().min(1, 'Agência deve ter pelo menos 3 caracteres').max(30, 'Agência deve ter no máximo 10 caracteres').optional(),
   account: z.string().min(1, 'Conta deve ter pelo menos 3 caracteres').max(30, 'Conta deve ter no máximo 10 caracteres').optional(),
   type: z
      .enum(['C', 'P'], {
         errorMap: () => ({ message: 'Tipo deve ser "C" ou "P"' }),
      })
      .optional(),
})
