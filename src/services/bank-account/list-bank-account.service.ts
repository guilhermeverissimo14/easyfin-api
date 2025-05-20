import { AppError } from '@/helpers/app-error'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const listBankAccountsService = async () => {
   const bankAccounts = await prisma.bankAccounts.findMany({
      orderBy: {
         bank: 'asc',
      },
   })

   if (!bankAccounts || bankAccounts.length === 0) {
      throw new AppError('Nenhuma conta bancária encontrada', 404)
   }

   return bankAccounts
}
