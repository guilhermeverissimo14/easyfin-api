import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const updateBankAccountService = async (
   id: string,
   bankAccountData: {
      bank?: string
      agency?: string
      account?: string
      type?: string
      active?: boolean
   },
) => {
   const bankAccount = await prisma.bankAccounts.findUnique({
      where: {
         id,
      },
   })

   if (!bankAccount) {
      throw new AppError('Conta bancária não encontrada', 404)
   }

   const updatedBankAccount = await prisma.bankAccounts.update({
      where: {
         id,
      },
      data: {
         ...bankAccountData,
      },
   })

   return updatedBankAccount
}
