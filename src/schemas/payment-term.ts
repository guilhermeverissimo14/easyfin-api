import { z } from 'zod'

export const createPaymentTermSchema = z.object({
   description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
   term: z.number().min(1, 'Prazo deve ser maior ou igual a 1'),
})
