import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getAccountsReceivableByIdService = async (id: string) => {
   const account = await prisma.accountsReceivable.findUnique({
      where: {
         id,
      },
      include: {
         Customer: true,
         CostCenter: true,
         PaymentMethod: true,
      },
   })

   const user = await prisma.user.findUnique({
      where: {
         id: account?.userId || '',
      },
   })

   if (!account) {
      throw new AppError('Conta a receber não encontrada', 404)
   }

   account.value = account.value != null ? account.value / 100 : 0
   account.receivedValue = account.receivedValue ? account.receivedValue / 100 : 0
   account.discount = account.discount ? account.discount / 100 : 0
   account.fine = account.fine ? account.fine / 100 : 0
   account.interest = account.interest ? account.interest / 100 : 0

   return {
      ...account,
      customer: {
         id: account.Customer.id,
         name: account.Customer.name,
      },
      costCenter: {
         id: account.CostCenter?.id || null,
         name: account.CostCenter?.name || null,
      },
      plannedPaymentMethod: {
         id: account.plannedPaymentMethod || null,
         name: account.PaymentMethod?.name || null,
      },
      paymentMethod: {
         id: account.PaymentMethod?.id || null,
         name: account.PaymentMethod?.name || null,
      },
      user: {
         id: account.userId || null,
         name: user ? user.name : null,
      },
      launchDate: account.launchDate ? account.launchDate.toISOString() : null,
      dueDate: account.dueDate ? account.dueDate.toISOString() : null,
      receiptDate: account.receiptDate ? account.receiptDate.toISOString() : null,
      documentDate: account.documentDate ? account.documentDate.toISOString() : null,
   }
}
