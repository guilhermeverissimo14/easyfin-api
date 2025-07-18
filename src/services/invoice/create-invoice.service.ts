import { PrismaClient, PaymentStatus, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

interface InvoiceData {
   invoiceNumber: string
   customerId: string
   paymentConditionId: string
   issueDate: string
   serviceValue: number
   retainsIss: boolean
   bankAccountId?: string
   costCenterId?: string
   notes?: string
   userId?: string
}

export const createInvoiceService = async (data: InvoiceData) => {
   const { invoiceNumber, customerId, paymentConditionId, issueDate, serviceValue, retainsIss, bankAccountId, costCenterId, notes, userId } = data

   return await prisma.$transaction(async (prisma) => {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } })
      if (!customer) {
         throw new AppError('Cliente não encontrado', 404)
      }

      const paymentTerms = await prisma.paymentTerms.findUnique({ where: { id: paymentConditionId } })
      if (!paymentTerms) {
         throw new AppError('Condição de pagamento não encontrada', 404)
      }

      const issueDateObj = new Date(issueDate)
      const year = issueDateObj.getFullYear()
      const month = issueDateObj.getMonth() + 1

      const taxRates = await prisma.taxRates.findFirst({
         where: {
            year,
            month,
         },
      })

      let issqnTaxRate: number | null = null
      let effectiveTaxRate: number | null = null
      let issqnValue: number | null = null
      let netValue: number = serviceValue

      let effectiveTax: number | null = null

      effectiveTaxRate = taxRates?.effectiveTaxRate ?? null

      if (retainsIss) {
         if (!taxRates) {
            throw new AppError('Alíquota não encontrada para o mês e ano informados', 404)
         }

         issqnTaxRate = taxRates.issqnTaxRate
         effectiveTaxRate = taxRates.effectiveTaxRate

         const serviceValueInReais = serviceValue / 100

         issqnValue = serviceValueInReais * issqnTaxRate
         netValue = serviceValue - issqnValue * 100
      }

      if (effectiveTaxRate !== null) {
         const serviceValueInReais = serviceValue / 100
         effectiveTax = serviceValueInReais * effectiveTaxRate

         if (retainsIss && issqnValue !== null) {
            effectiveTax = effectiveTax - issqnValue
         }
         effectiveTax = effectiveTax * 100 // Imposto efetivo
      }

      const invoice = await prisma.invoice.create({
         data: {
            invoiceNumber,
            customerId,
            paymentConditionId,
            issueDate: issueDateObj,
            month,
            year,
            dueDate: issueDateObj,
            serviceValue: serviceValue * 100,
            retainsIss,
            issqnTaxRate,
            effectiveTaxRate,
            issqnValue: issqnValue !== null ? issqnValue * 100 : null,
            netValue: netValue * 100,
            effectiveTax: effectiveTax !== null ? effectiveTax : null,
            bankAccountId,
            notes,
         },
      })

      const conditions = paymentTerms.condition.split(',').map(Number)
      const totalInstallments = conditions.length

      for (let i = 0; i < conditions.length; i++) {
         const daysToAdd = conditions[i]
         const dueDate = new Date(issueDateObj)
         dueDate.setDate(dueDate.getDate() + daysToAdd)

         await prisma.accountsReceivable.create({
            data: {
               customerId,
               documentNumber: invoiceNumber,
               documentDate: issueDateObj,
               launchDate: new Date(),
               dueDate,
               value: (serviceValue / totalInstallments) * 100,
               receivedValue: 0,
               discount: 0,
               interest: 0,
               fine: 0,
               installmentNumber: i + 1,
               totalInstallments,
               status: PaymentStatus.PENDING,
               paymentMethodId: paymentTerms.paymentMethodId,
               bankAccountId,
               costCenterId: costCenterId,
               plannedPaymentMethod: paymentTerms.paymentMethodId,
               userId,
            },
         })
      }

      return {
         ...invoice,
         serviceValue: invoice.serviceValue / 100,
         issqnValue: invoice.issqnValue ? invoice.issqnValue / 100 : 0,
         netValue: invoice.netValue ? invoice.netValue / 100 : 0,
         effectiveTax: invoice.effectiveTax ? invoice.effectiveTax / 100 : 0,
      }
   })
}
