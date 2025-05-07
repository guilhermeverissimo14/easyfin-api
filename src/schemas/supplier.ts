import { z } from 'zod';

export const createSupplierSchema = z.object({
    cnpj: z.string().min(14, 'CNPJ deve ter 14 caracteres').max(14, 'CNPJ deve ter 14 caracteres'),
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Formato de e-mail inválido').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    contact: z.string().optional(),
    retIss: z.boolean().default(false),
})

export const updateSupplierSchema = z.object({
    cnpj: z.string().min(14, 'CNPJ deve ter 14 caracteres').max(14, 'CNPJ deve ter 14 caracteres').optional(),
   name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
   email: z.string().email('Formato de e-mail inválido').optional(),
   phone: z.string().optional(),
   address: z.string().optional(),
   zipCode: z.string().optional(),
   city: z.string().optional(),
   state: z.string().optional(),
   country: z.string().optional(),
   contact: z.string().optional(),
   retIss: z.boolean().default(false).optional(),
})