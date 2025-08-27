import { z } from 'zod'

export const createPaymentTermSchema = z.object({
   paymentMethodId: z.string().uuid('ID do método de pagamento inválido'),
   condition: z.string().min(1, 'Condição de pagamento deve ter pelo menos 1 caracter'),
   description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres').optional(),
   installments: z.number().min(1, 'Número de parcelas deve ser maior ou igual a 1').optional(),
})
