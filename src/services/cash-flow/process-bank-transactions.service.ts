import { TransactionType } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { prisma } from '@/lib/prisma'
import { ParsedTransaction } from './parse-bank-transactions.service'

interface ProcessBankTransactionsServiceParams {
   bankAccountId: string
   filename: string
   transactions: ParsedTransaction[]
   costCenterId?: string
}

export const processBankTransactionsService = async ({ 
   bankAccountId, 
   filename, 
   transactions,
   costCenterId
}: ProcessBankTransactionsServiceParams) => {
   const bankAccount = await prisma.bankAccounts.findUnique({
      where: {
         id: bankAccountId,
      },
   })

   if (!bankAccount) {
      throw new AppError('Conta bancária não encontrada.', 404)
   }

   if (!bankAccount.active) {
      throw new AppError('Conta bancária inativa.', 400)
   }

   if (transactions.length === 0) {
      throw new AppError('Nenhuma transação válida para processar.', 400)
   }

   const firstTransaction = transactions[0]
   const firstDateStr = firstTransaction.date
   const datePartsFirst = firstDateStr.split('/')
   const isoDateStringFirst = `${datePartsFirst[2]}-${datePartsFirst[1]}-${datePartsFirst[0]}`
   const firstTransactionDate = new Date(isoDateStringFirst)

   const initialBalanceRecord = await prisma.bankBalance.findFirst({
      where: {
         bankAccountId,
         createdAt: {
            lt: firstTransactionDate,
         },
      },
      orderBy: {
         createdAt: 'desc',
      },
   })

   const initialBalance = initialBalanceRecord?.balance || 0

   await prisma.$transaction([
      prisma.cashFlow.deleteMany({
         where: {
            bankAccountId,
            csvFileName: filename,
         },
      }),
      prisma.bankTransactions.deleteMany({
         where: {
            bankAccountId,
            csvFileName: filename,
         },
      }),
   ])

   let currentBalance = initialBalance
   const dateControlMap = new Map<string, Date>()
   let importedLinesCount = 0

   for (const transaction of transactions) {
      const { date, historic, value, type, detailing } = transaction
      
      const dateParts = date.split('/')
      const baseDateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      const baseDate = new Date(`${baseDateStr}T03:00:00Z`)
      const baseDateKey = baseDateStr
      const valueCents = value * 100

      let transactionDate: Date

      if (!dateControlMap.has(baseDateKey)) {
         const lastOfDay = await prisma.bankTransactions.findFirst({
            where: {
               bankAccountId,
               transactionAt: {
                  gte: new Date(`${baseDateStr}T03:00:00Z`),
                  lt: new Date(`${baseDateStr}T23:59:59Z`),
               },
            },
            orderBy: {
               transactionAt: 'desc',
            },
         })

         if (lastOfDay) {
            transactionDate = new Date(lastOfDay.transactionAt.getTime() + 1 * 60 * 1000)
         } else {
            transactionDate = new Date(baseDate.getTime())
         }

         dateControlMap.set(baseDateKey, new Date(transactionDate))
      } else {
         const lastUsed = dateControlMap.get(baseDateKey)!
         transactionDate = new Date(lastUsed.getTime() + 1 * 60 * 1000)
         dateControlMap.set(baseDateKey, new Date(transactionDate))
      }

      if (!transactionDate || isNaN(transactionDate.getTime())) {
         console.warn('Transação ignorada por conter uma data inválida:', transaction)
         continue
      }

      try {
         await prisma.$transaction(async (prisma) => {
            let finalCostCenterId = transaction.costCenterId || costCenterId
            
            if (!finalCostCenterId) {
               const costCenterBankTransaction = await prisma.costCenter.findFirst({
                  where: {
                     name: {
                        contains: 'Transações Bancárias',
                        mode: 'insensitive',
                     },
                  },
               })
               finalCostCenterId = costCenterBankTransaction?.id || undefined
            }

            await prisma.bankTransactions.create({
               data: {
                  bankAccountId,
                  description: historic,
                  amount: valueCents,
                  detailing,
                  type,
                  transactionAt: transactionDate,
                  csv: true,
                  csvFileName: filename,
               },
            })

            currentBalance = type === TransactionType.CREDIT ? currentBalance + valueCents : currentBalance - valueCents

            await prisma.cashFlow.create({
               data: {
                  date: transactionDate,
                  historic,
                  value: valueCents,
                  type,
                  description: detailing,
                  balance: currentBalance,
                  bankAccountId,
                  costCenterId: finalCostCenterId,
                  csvFileName: filename,
               },
            })

            importedLinesCount++
         })
      } catch (error) {
         console.error('Erro ao processar a transação:', transaction, error)
      }
   }

   if (importedLinesCount === 0) {
      throw new AppError('Nenhuma transação foi importada com sucesso.', 400)
   }

   const allTransactions = await prisma.bankTransactions.findMany({
      where: {
         bankAccountId,
         transactionAt: {
            gte: firstTransactionDate,
         },
      },
      orderBy: {
         transactionAt: 'asc',
      },
   })

   let recalculateBalance = initialBalance

   for (const transaction of allTransactions) {
      recalculateBalance =
         transaction.type === TransactionType.CREDIT ? recalculateBalance + transaction.amount : recalculateBalance - transaction.amount

      await prisma.cashFlow.updateMany({
         where: {
            bankAccountId,
            date: transaction.transactionAt,
         },
         data: {
            balance: recalculateBalance,
         },
      })

      const bankBalance = await prisma.bankBalance.findFirst({
         where: {
            bankAccountId,
         },
      })

      if (!bankBalance) {
         await prisma.bankBalance.create({
            data: {
               bankAccountId,
               balance: recalculateBalance,
            },
         })
         continue
      }

      try {
         await prisma.bankBalance.update({
            where: {
               id: bankBalance.id,
            },
            data: {
               balance: recalculateBalance,
            },
         })
      } catch (error) {
         console.error('Erro ao atualizar o saldo bancário:', error)
         throw new AppError('Erro ao atualizar o saldo bancário.', 500)
      }
   }

   return {
      importedTransactions: importedLinesCount,
      finalBalance: recalculateBalance
   }
}