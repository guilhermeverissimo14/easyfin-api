import { PaymentStatus, PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const updateAccountPayableService = async (
   id: string,
   data: {
      supplierId?: string
      documentNumber?: string
      documentDate?: string
      launchDate?: string
      dueDate?: string
      paymentDate?: string
      value?: number
      paidValue?: number
      discount?: number
      fine?: number
      interest?: number
      installmentNumber?: number
      totalInstallments?: number
      costCenterId?: string
      plannedPaymentMethod?: string
      paymentMethodId?: string
      userId?: string
      observation?: string
      status?: string
   },
) => {
   const accountExists = await prisma.accountsPayable.findUnique({
      where: {
         id,
      },
   })

   if (!accountExists) {
      throw new AppError('Conta a pagar não encontrada', 404)
   }

   if (data.supplierId) {
      const supplierExists = await prisma.supplier.findUnique({ where: { id: data.supplierId } })
      if (!supplierExists) {
         throw new AppError('Fornecedor não encontrado', 404)
      }
   }

   try {
      const updatedAccount = await prisma.accountsPayable.update({
         where: {
            id,
         },
         data: {
            supplierId: data.supplierId,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate,
            launchDate: data.launchDate,
            dueDate: data.dueDate,
            paymentDate: data.paymentDate,
            value: data.value ? data.value * 100 : undefined,
            paidValue: data.paidValue ? data.paidValue * 100 : undefined,
            discount: data.discount ? data.discount * 100 : undefined,
            fine: data.fine ? data.fine * 100 : undefined,
            interest: data.interest ? data.interest * 100 : undefined,
            installmentNumber: data.installmentNumber,
            totalInstallments: data.totalInstallments,
            costCenterId: data.costCenterId,
            plannedPaymentMethod: data.plannedPaymentMethod,
            paymentMethodId: data.paymentMethodId,
            userId: data.userId,
            observation: data.observation,
            status: data.status as PaymentStatus,
         },
      })

      if (!updatedAccount) {
         throw new AppError('Erro ao atualizar conta a pagar', 500)
      }

      updatedAccount.value = updatedAccount.value != null ? updatedAccount.value / 100 : 0
      updatedAccount.paidValue = updatedAccount.paidValue ? updatedAccount.paidValue / 100 : 0
      updatedAccount.discount = updatedAccount.discount ? updatedAccount.discount / 100 : 0
      updatedAccount.fine = updatedAccount.fine ? updatedAccount.fine / 100 : 0
      updatedAccount.interest = updatedAccount.interest ? updatedAccount.interest / 100 : 0

      return updatedAccount
   } catch (error) {
      throw new AppError('Erro ao atualizar conta a pagar', 500)
   }
}
