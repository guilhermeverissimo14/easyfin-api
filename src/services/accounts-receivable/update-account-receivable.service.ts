import { PaymentStatus, PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const updateAccountReceivableService = async (
   id: string,
   data: {
      customerId?: string
      documentNumber?: string
      documentDate?: string
      launchDate?: string
      dueDate?: string
      receiptDate?: string
      value?: number
      receivedValue?: number
      discount?: number
      fine?: number
      interest?: number
      installmentNumber?: number
      totalInstallments?: number
      costCenterId?: string
      bankAccountId?: string
      plannedPaymentMethod?: string
      paymentMethodId?: string
      userId?: string
      observation?: string
      status?: string
   },
) => {
   const accountExists = await prisma.accountsReceivable.findUnique({
      where: {
         id,
      },
   })

   if (!accountExists) {
      throw new AppError('Conta a receber não encontrada', 404)
   }

   if (data.customerId) {
      const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } })
      if (!customerExists) {
         throw new AppError('Cliente não encontrado', 404)
      }
   }

   try {
      const updatedAccount = await prisma.accountsReceivable.update({
         where: {
            id,
         },
         data: {
            customerId: data.customerId,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate,
            launchDate: data.launchDate,
            dueDate: data.dueDate,
            receiptDate: data.receiptDate,
            value: data.value ? data.value * 100 : undefined,
            receivedValue: data.receivedValue ? data.receivedValue * 100 : undefined,
            discount: data.discount ? data.discount * 100 : undefined,
            fine: data.fine ? data.fine * 100 : undefined,
            interest: data.interest ? data.interest * 100 : undefined,
            installmentNumber: data.installmentNumber,
            totalInstallments: data.totalInstallments,
            costCenterId: data.costCenterId,
            bankAccountId: data.bankAccountId,
            plannedPaymentMethod: data.plannedPaymentMethod,
            paymentMethodId: data.paymentMethodId,
            userId: data.userId,
            observation: data.observation,
            status: data.status as PaymentStatus,
         },
      })

      if (!updatedAccount) {
         throw new AppError('Erro ao atualizar conta a receber', 500)
      }

      updatedAccount.value = updatedAccount.value != null ? updatedAccount.value / 100 : 0
      updatedAccount.receivedValue = updatedAccount.receivedValue ? updatedAccount.receivedValue / 100 : 0
      updatedAccount.discount = updatedAccount.discount ? updatedAccount.discount / 100 : 0
      updatedAccount.fine = updatedAccount.fine ? updatedAccount.fine / 100 : 0
      updatedAccount.interest = updatedAccount.interest ? updatedAccount.interest / 100 : 0

      return updatedAccount
   } catch (error) {
      throw new AppError('Erro ao atualizar conta a receber', 500)
   }
}
