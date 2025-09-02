import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'

export const getAccountsPayableByIdService = async (id: string) => {
   const account = await prisma.accountsPayable.findUnique({
      where: {
         id,
      },
      include: {
         Supplier: true,
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
      throw new AppError('Conta a pagar não encontrada', 404)
   }

   account.value = account.value != null ? account.value / 100 : 0
   account.paidValue = account.paidValue ? account.paidValue / 100 : 0
   account.discount = account.discount ? account.discount / 100 : 0
   account.fine = account.fine ? account.fine / 100 : 0
   account.interest = account.interest ? account.interest / 100 : 0

   return {
      ...account,
      supplier: {
         id: account.Supplier.id,
         name: account.Supplier.name,
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
      paymentDate: account.paymentDate ? account.paymentDate.toISOString() : null,
      documentDate: account.documentDate ? account.documentDate.toISOString() : null,
   }
}
