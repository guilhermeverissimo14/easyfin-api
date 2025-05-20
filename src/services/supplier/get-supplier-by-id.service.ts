import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getSupplierByIdService = async (id: string) => {
   const supplier = await prisma.supplier.findUnique({
      where: {
         id: id,
      },
   })

   console.log('Supplier found:', supplier)

   if (!supplier) {
      throw new AppError('Fornecedor não encontrado', 404)
   }

   return supplier
}
