import { prisma } from '@/lib/prisma'
import { setToEndOfDayUTC, setToStartOfDayUTC } from '@/utils/format'

export const listInvoicesService = async (filters: { customerId?: string; bankAccountId?: string; issueDateStart?: Date; issueDateEnd?: Date }) => {
   let { customerId, bankAccountId, issueDateStart, issueDateEnd } = filters

   if (issueDateStart) {
      issueDateStart = setToStartOfDayUTC(issueDateStart)
   }
   if (issueDateEnd) {
      issueDateEnd = setToEndOfDayUTC(issueDateEnd)
   }

   const whereClause: any = {
      customerId,
      bankAccountId,
   }

   if (issueDateStart || issueDateEnd) {
      whereClause.issueDate = {
         ...(issueDateStart ? { gte: issueDateStart } : {}),
         ...(issueDateEnd ? { lte: issueDateEnd } : {}),
      }
   }

   let invoices

   try {
      invoices = await prisma.invoice.findMany({
         where: whereClause,
         include: {
            Customer: true,
            BankAccount: true,
            PaymentCondition: true,
         },
         orderBy: {
            issueDate: 'asc',
         },
      })
   } catch (error) {
      console.error('Erro ao listar faturas:', error)
      throw new Error('Erro ao listar faturas')
   }

   let accountsReceivable = await prisma.accountsReceivable.findMany({
      where: {
         documentNumber: invoices[0]?.invoiceNumber,
      },
      include: {
         CostCenter: true,
      },
   })

   return invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate ? invoice.issueDate.toISOString() : null,
      month: invoice.month,
      year: invoice.year,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      serviceValue: invoice.serviceValue / 100,
      retainsIss: invoice.retainsIss,
      issqnTaxRate: invoice.issqnTaxRate,
      effectiveTaxRate: invoice.effectiveTaxRate,
      issqnValue: invoice.issqnValue ? invoice.issqnValue / 100 : null,
      netValue: invoice.netValue ? invoice.netValue / 100 : null,
      effectiveTax: invoice.effectiveTax ? invoice.effectiveTax / 100 : null,
      notes: invoice.notes,
      customer: {
         id: invoice.customerId,
         name: invoice.Customer.name,
      },
      bankAccount: invoice.bankAccountId
         ? {
              id: invoice.bankAccountId,
              bank: invoice.BankAccount?.bank,
              agency: invoice.BankAccount?.agency,
              account: invoice.BankAccount?.account,
           }
         : null,
      paymentCondition: {
         id: invoice.paymentConditionId,
         condition: invoice.PaymentCondition.condition,
         description: invoice.PaymentCondition.description,
         installments: invoice.PaymentCondition.installments,
      },
      costCenter: {
         id: accountsReceivable.find((ar) => ar.documentNumber === invoice.invoiceNumber)?.CostCenter?.id || null,
         name: accountsReceivable.find((ar) => ar.documentNumber === invoice.invoiceNumber)?.CostCenter?.name || null,
      },
   }))
}
