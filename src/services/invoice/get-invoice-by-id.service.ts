import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getInvoiceByIdService = async (id: string) => {
   const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
         Customer: true,
         BankAccount: true,
         PaymentCondition: true,
      },
   })

   if (!invoice) {
      throw new Error('Fatura não encontrada')
   }

   let accountsReceivable = await prisma.accountsReceivable.findMany({
      where: {
         documentNumber: invoice?.invoiceNumber,
      },
      include: {
         CostCenter: true,
      },
   })

   return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      paymentCondition: {
         id: invoice.paymentConditionId,
         condition: invoice.PaymentCondition.condition,
      },
      issueDate: invoice.issueDate,
      serviceValue: invoice.serviceValue / 100,
      retainsIss: invoice.retainsIss,
      bankAccount: invoice.bankAccountId
         ? {
              id: invoice.bankAccountId,
              bank: invoice.BankAccount?.bank,
              agency: invoice.BankAccount?.agency,
              account: invoice.BankAccount?.account,
           }
         : null,
      costCenter: {
         id: accountsReceivable.find((ar) => ar.documentNumber === invoice.invoiceNumber)?.CostCenter?.id || null,
         name: accountsReceivable.find((ar) => ar.documentNumber === invoice.invoiceNumber)?.CostCenter?.name || null,
      },
      notes: invoice.notes,
      userId: accountsReceivable[0]?.userId || null,
      accountsReceivable: accountsReceivable.map((ar) => ({
         id: ar.id,
         documentNumber: ar.documentNumber,
         costCenterId: ar.costCenterId,
         value: ar.value ? ar.value / 100 : null,
         dueDate: ar.dueDate,
         status: ar.status,
      })),
   }
}
