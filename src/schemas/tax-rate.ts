import { z } from 'zod'

export const createTaxRateSchema = z.object({
   year: z.number().min(2000, 'Ano deve ser maior ou igual a 2000'),
   month: z.number().min(1, 'Mês deve ser maior ou igual a 1').max(12, 'Mês deve ser menor ou igual a 12'),
   issqnTaxRate: z.number().min(0, 'Taxa ISSQN deve ser maior ou igual a 0').max(100, 'Taxa ISSQN deve ser menor ou igual a 100'),
   effectiveTaxRate: z.number().min(0, 'Taxa efetiva deve ser maior ou igual a 0').max(100, 'Taxa efetiva deve ser menor ou igual a 100'),
})

export const updateTaxRateSchema = z.object({
   year: z.number().min(2000, 'Ano deve ser maior ou igual a 2000').optional(),
   month: z.number().min(1, 'Mês deve ser maior ou igual a 1').max(12, 'Mês deve ser menor ou igual a 12').optional(),
   issqnTaxRate: z.number().min(0, 'Taxa ISSQN deve ser maior ou igual a 0').max(100, 'Taxa ISSQN deve ser menor ou igual a 100').optional(),
   effectiveTaxRate: z.number().min(0, 'Taxa efetiva deve ser maior ou igual a 0').max(100, 'Taxa efetiva deve ser menor ou igual a 100').optional(),
})
