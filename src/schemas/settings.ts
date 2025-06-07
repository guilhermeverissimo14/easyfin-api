import { z } from 'zod'

export const updateSettingsSchema = z.object({
   cashFlowDefault: z.enum(['CASH', 'BANK'], {
      errorMap: () => ({ message: 'Tipo deve ser "CASH" ou "BANK"' }),
   }),
   bankAccountDefault: z.string().optional(),
})
