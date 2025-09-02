import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getBankAccountByIdService = async (id: string) => {
   const bankAccount = await prisma.bankAccounts.findUnique({
      where: {
         id,
      },
   })

   if (!bankAccount) {
      throw new AppError('Conta bancária não encontrada', 404)
   }

   return bankAccount
}
