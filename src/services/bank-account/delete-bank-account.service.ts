import { AppError } from '@/helpers/app-error'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const deleteBankAccountService = async (id: string, userRole: string) => {
   if (userRole !== UserRole.ADMIN) {
      throw new AppError('Acesso negado', 403)
   }

   const bankAccount = await prisma.bankAccounts.findUnique({
      where: {
         id,
      },
   })

   if (!bankAccount) {
      throw new AppError('Conta bancária não encontrada', 404)
   }

   try {
      await prisma.bankAccounts.delete({
         where: {
            id,
         },
      })
   } catch (error) {
      console.error(error)
      throw new Error('Erro ao remover a conta bancária')
   }
   return { message: 'Conta bancária removida com sucesso' }
}
