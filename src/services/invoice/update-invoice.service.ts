import { PrismaClient, PaymentStatus } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

interface UpdateInvoiceData {
   id: string
   invoiceNumber?: string
   customerId?: string
   paymentConditionId?: string
   issueDate?: string
   serviceValue?: number
   retainsIss?: boolean
   bankAccountId?: string
   costCenterId?: string
   notes?: string
   userId?: string
}

export const updateInvoiceService = async (data: UpdateInvoiceData) => {
   const { id, invoiceNumber, customerId, paymentConditionId, issueDate, serviceValue, retainsIss, bankAccountId, costCenterId, notes, userId } = data

   try {
      return await prisma.$transaction(async (prisma) => {
         const existingInvoice = await prisma.invoice.findUnique({ where: { id } })

         if (!existingInvoice) {
            throw new AppError('Fatura não encontrada', 404)
         }

         let customer
         if (customerId) {
            customer = await prisma.customer.findUnique({ where: { id: customerId } })
            if (!customer) {
               throw new AppError('Cliente não encontrado', 404)
            }
         }

         let issueDateObj
         let year
         let month
         let taxRates

         if (issueDate) {
            issueDateObj = new Date(issueDate)
            year = issueDateObj.getFullYear()
            month = issueDateObj.getMonth() + 1

            taxRates = await prisma.taxRates.findFirst({
               where: {
                  year,
                  month,
               },
            })
         }

         let issqnTaxRate: number | null = existingInvoice.issqnTaxRate
         let effectiveTaxRate: number | null = existingInvoice.effectiveTaxRate
         let issqnValue: number | null = existingInvoice.issqnValue ? existingInvoice.issqnValue / 100 : null
         let netValue: number = existingInvoice.netValue ? existingInvoice.netValue / 100 : existingInvoice.serviceValue / 100
         let effectiveTax: number | null = existingInvoice.effectiveTax ? existingInvoice.effectiveTax / 100 : null

         if (typeof retainsIss === 'boolean' && issueDate && serviceValue) {
            if (retainsIss) {
               if (!taxRates) {
                  throw new AppError('Alíquota não encontrada para o mês e ano informados', 404)
               }

               issqnTaxRate = taxRates.issqnTaxRate
               effectiveTaxRate = taxRates.effectiveTaxRate

               const serviceValueInReais = serviceValue / 100

               issqnValue = serviceValueInReais * issqnTaxRate
               netValue = serviceValue - issqnValue
            } else {
               issqnTaxRate = null
               issqnValue = null
               netValue = serviceValue
            }

            if (effectiveTaxRate !== null) {
               const serviceValueInReais = serviceValue / 100
               effectiveTax = serviceValueInReais * effectiveTaxRate

               if (retainsIss && issqnValue !== null) {
                  effectiveTax = effectiveTax - issqnValue
               }
               effectiveTax = effectiveTax * 100
            }
         }

         const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
               invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : existingInvoice.invoiceNumber,
               customerId: customerId !== undefined ? customerId : existingInvoice.customerId,
               paymentConditionId: paymentConditionId !== undefined ? paymentConditionId : existingInvoice.paymentConditionId,
               issueDate: issueDate ? issueDateObj : existingInvoice.issueDate,
               month: issueDate ? month : existingInvoice.month,
               year: issueDate ? year : existingInvoice.year,
               dueDate: issueDate ? issueDateObj : existingInvoice.dueDate,
               serviceValue: serviceValue !== undefined ? serviceValue * 100 : existingInvoice.serviceValue,
               retainsIss: retainsIss !== undefined ? retainsIss : existingInvoice.retainsIss,
               issqnTaxRate: issqnTaxRate,
               effectiveTaxRate: effectiveTaxRate,
               issqnValue: issqnValue !== null ? issqnValue * 100 : null,
               netValue: netValue * 100,
               effectiveTax: effectiveTax !== null ? effectiveTax : null,
               bankAccountId: bankAccountId !== undefined ? bankAccountId : existingInvoice.bankAccountId,
               notes: notes !== undefined ? notes : existingInvoice.notes,
            },
         })

         if (typeof retainsIss === 'boolean' && serviceValue && existingInvoice.retainsIss !== retainsIss) {
            const accountsReceivable = await prisma.accountsReceivable.findMany({
               where: {
                  documentNumber: existingInvoice.invoiceNumber,
                  customerId: existingInvoice.customerId,
                  status: {
                     not: PaymentStatus.PAID,
                  },
               },
            })

            const totalInstallments = accountsReceivable.length

            for (const receivable of accountsReceivable) {
               const newValue = (serviceValue / totalInstallments) * 100

               await prisma.accountsReceivable.update({
                  where: {
                     id: receivable.id,
                  },
                  data: {
                     value: newValue,
                     costCenterId: costCenterId !== undefined ? costCenterId : receivable.costCenterId,
                     userId: userId !== undefined ? userId : receivable.userId,
                  },
               })
            }
         } else if (costCenterId) {
            await prisma.accountsReceivable.updateMany({
               where: {
                  documentNumber: updatedInvoice.invoiceNumber,
                  customerId: updatedInvoice.customerId,
               },
               data: {
                  costCenterId,
                  userId: userId !== undefined ? userId : undefined,
               },
            })
         }

         return {
            ...updatedInvoice,
            serviceValue: updatedInvoice.serviceValue / 100,
            issqnValue: updatedInvoice.issqnValue ? updatedInvoice.issqnValue / 100 : 0,
            netValue: updatedInvoice.netValue ? updatedInvoice.netValue / 100 : 0,
            effectiveTax: updatedInvoice.effectiveTax ? updatedInvoice.effectiveTax / 100 : 0,
         }
      })
   } catch (error: any) {
      if (error instanceof AppError) {
         throw error
      }
      console.error(error)
      throw new AppError('Erro ao atualizar fatura', 500)
   }
}
