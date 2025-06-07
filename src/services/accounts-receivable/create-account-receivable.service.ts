import { PaymentStatus, PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

export const createAccountReceivableService = async (data: {
   customerId: string
   documentNumber: string
   documentDate: string
   launchDate?: string
   dueDate: string
   receiptDate?: string
   value: number
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
}) => {
   const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } })
   if (!customerExists) {
      throw new AppError('Cliente não encontrado', 404)
   }

   try {
      const existingAccount = await prisma.accountsReceivable.findFirst({
         where: {
            customerId: data.customerId,
            documentNumber: data.documentNumber,
            documentDate: new Date(data.documentDate),
            dueDate: new Date(data.dueDate),
         },
      })

      if (existingAccount) {
         throw new AppError(
            'Já existe uma conta a receber com os mesmos dados. Caso deseje criar em uma variação diferente, altere o número da parcela ou a data de vencimento.',
            400,
         )
      }
   } catch (error) {
      console.log('Erro ao verificar conta a receber existente:', error)
      throw new AppError('Erro ao verificar conta a receber existente', 500)
   }

   try {
      const account = await prisma.accountsReceivable.create({
         data: {
            customerId: data.customerId,
            documentNumber: data.documentNumber,
            documentDate: new Date(data.documentDate),
            launchDate: data.launchDate || new Date(),
            dueDate: new Date(data.dueDate),
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : null,
            value: data.value * 100 || 0,
            receivedValue: 0,
            discount: 0,
            fine: 0,
            interest: 0,
            installmentNumber: 1,
            totalInstallments: 1,
            costCenterId: data.costCenterId,
            bankAccountId: data.bankAccountId,
            plannedPaymentMethod: data.plannedPaymentMethod,
            paymentMethodId: data.plannedPaymentMethod || null,
            userId: data.userId,
            observation: data.observation || null,
            status: (data.status as PaymentStatus) || PaymentStatus.PENDING,
         },
      })

      if (!account) {
         throw new AppError('Erro ao criar conta a receber', 500)
      }

      return {
         ...account,
         value: account.value != null ? account.value / 100 : 0,
         launchDate: account.launchDate ? account.launchDate.toISOString() : null,
         dueDate: account.dueDate ? account.dueDate.toISOString() : null,
         receiptDate: account.receiptDate ? account.receiptDate.toISOString() : null,
         documentDate: account.documentDate ? account.documentDate.toISOString() : null,
      }
   } catch (error) {
      throw new AppError('Erro ao criar conta a receber', 500)
   }
}
