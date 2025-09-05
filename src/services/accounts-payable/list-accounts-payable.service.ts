import { setToEndOfDayUTC, setToStartOfDayUTC } from '@/utils/format'
import { PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const listAccountsPayableService = async (filters: {
   supplierId?: string
   costCenterId?: string
   status?: PaymentStatus
   paymentMethodId?: string
   dueDateStart?: Date
   dueDateEnd?: Date
   documentDateStart?: Date
   documentDateEnd?: Date
}) => {
   let { supplierId, costCenterId, status, paymentMethodId, dueDateStart, dueDateEnd, documentDateStart, documentDateEnd } = filters

   if (dueDateStart) {
      dueDateStart = setToStartOfDayUTC(dueDateStart)
   }
   if (dueDateEnd) {
      dueDateEnd = setToEndOfDayUTC(dueDateEnd)
   }

   if (documentDateStart) {
      documentDateStart = setToStartOfDayUTC(documentDateStart)
   }
   if (documentDateEnd) {
      documentDateEnd = setToEndOfDayUTC(documentDateEnd)
   }

   const whereClause: any = {
      supplierId,
      costCenterId,
      paymentMethodId,
      status,
   }

   if (dueDateStart || dueDateEnd) {
      whereClause.dueDate = {
         ...(dueDateStart ? { gte: dueDateStart } : {}),
         ...(dueDateEnd ? { lte: dueDateEnd } : {}),
      }
   }

   if (documentDateStart || documentDateEnd) {
      whereClause.documentDate = {
         ...(documentDateStart ? { gte: documentDateStart } : {}),
         ...(documentDateEnd ? { lte: documentDateEnd } : {}),
      }
   }

   let accounts

   try {
      accounts = await prisma.accountsPayable.findMany({
         where: whereClause,
         include: {
            Supplier: true,
            CostCenter: true,
            PaymentMethod: true,
         },
         orderBy: {
            dueDate: 'asc',
         },
      })
   } catch (error) {
      console.error('Erro ao listar contas a pagar:', error)
      throw new Error('Erro ao listar contas a pagar')
   }

   // Buscar todos os documentNumbers que existem no cashFlow
   const cashFlowDocuments = await prisma.cashFlow.findMany({
      select: {
         documentNumber: true,
      },
      where: {
         documentNumber: {
            not: null,
         },
      },
   })

   const cashFlowDocumentsSet = new Set(
      cashFlowDocuments
         .map((cashFlow) => cashFlow.documentNumber)
         .filter((docNumber): docNumber is string => docNumber !== null),
   )

   accounts.forEach((account) => {
      account.value = account.value != null ? account.value / 100 : 0
      account.paidValue = account.paidValue ? account.paidValue / 100 : 0
      account.discount = account.discount ? account.discount / 100 : 0
      account.fine = account.fine ? account.fine / 100 : 0
      account.interest = account.interest ? account.interest / 100 : 0
   })

   return accounts.map((account) => ({
      id: account.id,
      documentNumber: account.documentNumber,
      documentDate: account.documentDate ? account.documentDate.toISOString() : null,
      launchDate: account.launchDate ? account.launchDate.toISOString() : null,
      dueDate: account.dueDate ? account.dueDate.toISOString() : null,
      paymentDate: account.paymentDate ? account.paymentDate.toISOString() : null,
      value: account.value,
      paidValue: account.paidValue || 0,
      discount: account.discount || 0,
      fine: account.fine || 0,
      interest: account.interest || 0,
      installmentNumber: account.installmentNumber || 1,
      totalInstallments: account.totalInstallments || 1,
      observation: account.observation || null,
      status: account.status,
      userId: account.userId || null,
      hasCashFlow: account.documentNumber
         ? cashFlowDocumentsSet.has(account.documentNumber)
         : false,
      supplier: {
         id: account.supplierId,
         name: account.Supplier.name,
      },
      costCenter: {
         id: account.costCenterId || null,
         name: account.CostCenter?.name || null,
      },
      paymentMethod: {
         id: account.paymentMethodId || null,
         name: account.PaymentMethod?.name || null,
      },
   }))
}
