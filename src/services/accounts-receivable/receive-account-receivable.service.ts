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
   let lastBalance = 0

   if (bankAccountId) {
      const lastCashFlow = await prisma.cashFlow.findFirst({
         where: {
            bankAccountId,
         },
         orderBy: {
            date: 'desc',
         },
      })

      lastBalance = lastCashFlow?.balance || 0
   }

   if (cashBoxId) {
      const lastCashFlow = await prisma.cashFlow.findFirst({
         where: {
            cashBoxId,
         },
         orderBy: {
            date: 'desc',
         },
      })

      lastBalance = lastCashFlow?.balance || 0
   }

   await prisma.cashFlow.create({
      data: {
         date,
         historic,
         type,
         description,
         value,
         balance: type === TransactionType.CREDIT ? lastBalance + value : lastBalance - value,
         costCenterId,
         bankAccountId: bankAccountId || null,
         cashBoxId: cashBoxId || null,
      },
   })
}

export const receiveAccountReceivableService = async (
   id: string,
   data: {
      fine?: number
      interest?: number
      discount?: number
      observation?: string
      paymentMethodId?: string
      receiptDate?: Date
      costCenterId?: string
      bankAccountId?: string
   },
) => {
   const account = await prisma.accountsReceivable.findUnique({
      where: {
         id,
      },
   })

   if (!account) {
      throw new AppError('Conta a receber não encontrada', 404)
   }

   if (account.status === PaymentStatus.PAID) {
      throw new AppError('Esta conta já está recebida', 400)
   }

   const { fine = 0, interest = 0, discount = 0, observation, paymentMethodId, receiptDate = new Date(), costCenterId = account.costCenterId } = data

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
      throw new AppError('O valor da conta a receber está ausente', 400)
   }

   const amountToReceive = account.value - discount + fine + interest

   try {
      const updatedAccount = await prisma.$transaction(async (prisma) => {
         const updatedAccount = await prisma.accountsReceivable.update({
            where: {
               id,
            },
            data: {
               fine,
               interest,
               discount,
               observation,
               paymentMethodId: finalPaymentMethodId,
               receiptDate,
               costCenterId,
               status: PaymentStatus.PAID,
               receivedValue: amountToReceive,
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
                  type: TransactionType.CREDIT,
                  description: `Recebimento de conta a receber`,
                  detailing: observation,
                  amount: amountToReceive,
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
                     balance: bankBalance.balance + amountToReceive,
                  },
               })
            }

            await createCashFlowEntry(
               prisma,
               receiptDate,
               `Recebimento de conta a receber`,
               TransactionType.CREDIT,
               observation,
               amountToReceive,
               costCenterId,
               bankAccount.id,
               undefined,
            )

            return {
               ...updatedAccount,
               value: updatedAccount.value ? updatedAccount.value / 100 : 0,
               receivedValue: updatedAccount.receivedValue ? updatedAccount.receivedValue / 100 : 0,
            }
         }

         const cash = await prisma.cashBox.findFirst()

         if (!cash) {
            throw new AppError('Caixa não encontrado', 404)
         }

         await prisma.cashTransaction.create({
            data: {
               cashBoxId: cash.id,
               type: TransactionType.CREDIT,
               description: `Recebimento de conta a receber`,
               amount: amountToReceive,
               transactionAt: new Date(),
            },
         })

         await prisma.cashBox.update({
            where: {
               id: cash.id,
            },
            data: {
               balance: {
                  increment: amountToReceive,
               },
            },
         })

         await createCashFlowEntry(
            prisma,
            receiptDate,
            `Recebimento de conta a receber`,
            TransactionType.CREDIT,
            observation,
            amountToReceive,
            costCenterId,
            undefined,
            cash.id,
         )

         return {
            ...updatedAccount,
            value: updatedAccount.value ? updatedAccount.value / 100 : 0,
            receivedValue: updatedAccount.receivedValue ? updatedAccount.receivedValue / 100 : 0,
         }
      })

      // return {
      //    ...updatedAccount,
      //    value: updatedAccount.value ? updatedAccount.value / 100 : 0,
      //    receivedValue: updatedAccount.receivedValue ? updatedAccount.receivedValue / 100 : 0,
      // }
   } catch (error) {
      throw new AppError('Error receiving account receivable', 500)
   }
}
