import { z } from 'zod'

export const createCashFlowSchema = z.object({
   date: z.string().datetime({ message: 'Data inválida' }),
   historic: z.string().min(1, 'Histórico é obrigatório').max(255, 'Histórico deve ter no máximo 255 caracteres'),
   type: z.enum(['CREDIT', 'DEBIT'], {
      errorMap: () => ({ message: 'Tipo deve ser "CREDIT" ou "DEBIT"' }),
   }),
   description: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').optional(),
   value: z.number().positive('Valor deve ser positivo'),
   costCenterId: z.string().uuid('ID de centro de custo inválido').optional(),
   bankAccountId: z.string().uuid('ID de conta bancária inválido').optional(),
   cashBoxId: z.string().uuid('ID de caixa inválido').optional(),
})

export const updateCostCenterCashFlowSchema = z.object({
   costCenterId: z.string().uuid('ID de centro de custo inválido').optional(),
})
