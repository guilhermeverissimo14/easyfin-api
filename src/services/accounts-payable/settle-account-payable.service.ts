import { PrismaClient, PaymentStatus, TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

const createCashFlowEntry = async (
   prisma: any,
   date: Date,
   historic: string,
   type: TransactionType,
   description: string | null | undefined,
   value: number,
   costCenterId: string | null | undefined,
   bankAccountId: string | null | undefined,
   cashBoxId: string | null | undefined,
) => {
   // Cria o lançamento primeiro com saldo temporário
   const newEntry = await prisma.cashFlow.create({
      data: {
         date,
         historic,
         type,
         description,
         value,
         balance: 0, // Será recalculado
         costCenterId,
         bankAccountId: bankAccountId || null,
         cashBoxId: cashBoxId || null,
      },
   })

   // Recalcula todos os saldos da conta/caixa ordenando por data
   if (bankAccountId) {
      await recalculateBalancesForAccount(prisma, bankAccountId)
   }
   
   if (cashBoxId) {
      await recalculateBalancesForCashBox(prisma, cashBoxId)
   }

   return newEntry
}

// Função auxiliar para recalcular saldos de conta bancária
const recalculateBalancesForAccount = async (prisma: any, bankAccountId: string) => {
   const entries = await prisma.cashFlow.findMany({
      where: { bankAccountId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   for (const entry of entries) {
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance },
      })
   }
}

// Função auxiliar para recalcular saldos de caixa
const recalculateBalancesForCashBox = async (prisma: any, cashBoxId: string) => {
   const entries = await prisma.cashFlow.findMany({
      where: { cashBoxId },
      orderBy: [
         { date: 'asc' },
         { createdAt: 'asc' }
      ],
   })

   let balance = 0
   for (const entry of entries) {
      balance = entry.type === TransactionType.CREDIT ? balance + entry.value : balance - entry.value
      await prisma.cashFlow.update({
         where: { id: entry.id },
         data: { balance },
      })
   }
}

export const settleAccountPayableService = async (
   id: string,
   data: {
      fine?: number
      interest?: number
      discount?: number
      observation?: string
      paymentMethodId?: string
      paymentDate?: Date
      costCenterId?: string
      bankAccountId?: string
   },
) => {
   const account = await prisma.accountsPayable.findUnique({
      where: {
         id,
      },
   })

   if (!account) {
      throw new AppError('Conta a pagar não encontrada', 404)
   }

   if (account.status === PaymentStatus.PAID) {
      throw new AppError('Esta conta já está quitada', 400)
   }

   const { fine = 0, interest = 0, discount = 0, observation, paymentMethodId, paymentDate = new Date(), costCenterId = account.costCenterId } = data

   let finalPaymentMethodId = paymentMethodId || account.paymentMethodId || account.plannedPaymentMethod || null

   if (finalPaymentMethodId) {
      const paymentMethodExists = await prisma.paymentMethod.findUnique({
         where: {
            id: finalPaymentMethodId,
         },
      })

      if (!paymentMethodExists) {
         throw new AppError('Método de pagamento não encontrado', 404)
      }
   }

   if (account.value === null || account.value === undefined) {
      throw new AppError('O valor da conta a pagar está ausente', 400)
   }

   const amountToSettle = account.value - discount + fine + interest

   try {
      const updatedAccount = await prisma.$transaction(async (prisma) => {
         const updatedAccount = await prisma.accountsPayable.update({
            where: {
               id,
            },
            data: {
               fine,
               interest,
               discount,
               observation,
               paymentMethodId: finalPaymentMethodId,
               paymentDate,
               costCenterId,
               status: PaymentStatus.PAID,
               paidValue: amountToSettle,
            },
         })

         if (data.bankAccountId) {
            const bankAccount = await prisma.bankAccounts.findUnique({
               where: {
                  id: data.bankAccountId,
               },
            })

            if (!bankAccount) {
               throw new AppError('Conta bancária não encontrada', 404)
            }

            await prisma.bankTransactions.create({
               data: {
                  bankAccountId: bankAccount.id,
                  type: TransactionType.DEBIT,
                  description: `Liquidação de conta a pagar`,
                  detailing: observation,
                  amount: amountToSettle,
                  transactionAt: new Date(),
               },
            })

            const bankBalance = await prisma.bankBalance.findFirst({
               where: {
                  bankAccountId: bankAccount.id,
               },
            })

            if (bankBalance) {
               await prisma.bankBalance.update({
                  where: {
                     id: bankBalance.id,
                  },
                  data: {
                     balance: bankBalance.balance - amountToSettle,
                  },
               })
            }

            await createCashFlowEntry(
               prisma,
               paymentDate,
               `Liquidação de conta a pagar`,
               TransactionType.DEBIT,
               observation,
               amountToSettle,
               costCenterId,
               bankAccount.id,
               undefined,
            )

            return {
               ...updatedAccount,
               value: updatedAccount.value ? updatedAccount.value / 100 : 0,
               paidValue: updatedAccount.paidValue ? updatedAccount.paidValue / 100 : 0,
            }
         }

         const cash = await prisma.cashBox.findFirst()

         if (!cash) {
            throw new AppError('Caixa não encontrado', 404)
         }

         await prisma.cashTransaction.create({
            data: {
               cashBoxId: cash.id,
               type: TransactionType.DEBIT,
               description: `Liquidação de conta a pagar`,
               amount: amountToSettle,
               transactionAt: new Date(),
            },
         })

         await prisma.cashBox.update({
            where: {
               id: cash.id,
            },
            data: {
               balance: {
                  decrement: amountToSettle,
               },
            },
         })

         await createCashFlowEntry(
            prisma,
            paymentDate,
            `Liquidação de conta a pagar`,
            TransactionType.DEBIT,
            observation,
            amountToSettle,
            costCenterId,
            undefined,
            cash.id,
         )

         return {
            ...updatedAccount,
            value: updatedAccount.value ? updatedAccount.value / 100 : 0,
            paidValue: updatedAccount.paidValue ? updatedAccount.paidValue / 100 : 0,
         }
      })

      return {
         ...updatedAccount,
         value: updatedAccount.value ? updatedAccount.value / 100 : 0,
         paidValue: updatedAccount.paidValue ? updatedAccount.paidValue / 100 : 0,
      }
   } catch (error) {
      throw new AppError('Error settling account payable', 500)
   }
}
