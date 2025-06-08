import { PrismaClient, TransactionType } from '@prisma/client'
import * as XLSX from 'xlsx'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

interface ImportBankTransactionsServiceParams {
   bankAccountId: string
   file: Buffer
   filename: string
}

export const importBankTransactionsService = async ({ bankAccountId, file, filename }: ImportBankTransactionsServiceParams) => {
   try {
      const workbook = XLSX.read(file, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 3 })

      if (!Array.isArray(data)) {
         throw new AppError('Dados da planilha em formato inválido.', 400)
      }

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

      // 1. Obtem a data da primeira transação no CSV
      const firstRow = data[0] as [Date, string, number, string, string]
      if (!firstRow || !firstRow[0]) {
         throw new AppError('Arquivo CSV vazio ou com formato inválido.', 400)
      }
      const datePartsFirst = (firstRow[0] as any).split('/')
      const isoDateStringFirst = `${datePartsFirst[2]}-${datePartsFirst[1]}-${datePartsFirst[0]}`
      const firstTransactionDate = new Date(isoDateStringFirst)

      // 2. Obtem o saldo bancário mais recente ANTERIOR à data da primeira transação
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

      // 3. Remove transações existentes para este arquivo
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

      // 4. Importa as transações do CSV e recalcular o saldo
      let currentBalance = initialBalance

      for (const row of data) {
         if (!Array.isArray(row) || row.length < 5) {
            console.warn('Linha ignorada por ter um formato inválido:', row)
            continue
         }

         const [date, historic, value, type, detailing] = row as [Date, string, number, string, string]

         if (!date || !historic || !value || !type) {
            console.warn('Linha ignorada por conter dados incompletos:', row)
            continue
         }

         // Converte a data para o formato ISO 8601 (YYYY-MM-DD)
         const dateParts = (date as any).split('/')
         if (dateParts.length !== 3) {
            console.warn('Linha ignorada por conter uma data inválida:', row)
            continue
         }
         const isoDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
         let transactionDate = new Date(isoDateString)

         const transactionType = type.trim().toUpperCase() === 'C' ? TransactionType.CREDIT : TransactionType.DEBIT
         const transactionValue = Math.round(Number(value) * 100)

         if (isNaN(transactionValue) || transactionValue <= 0) {
            console.warn('Linha ignorada por conter um valor inválido:', row)
            continue
         }

         if (!transactionDate || isNaN(transactionDate.getTime())) {
            console.warn('Linha ignorada por conter uma data inválida:', row)
            continue
         }

         const timeMatch = detailing?.match(/(\d{2}:\d{2})/)

         if (timeMatch) {
            const [hours, minutes] = timeMatch[1].split(':').map(Number)

            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
               console.warn('Linha ignorada por conter um horário inválido:', row)
               continue
            }

            transactionDate.setHours(hours)
            transactionDate.setMinutes(minutes)
            transactionDate.setSeconds(0)
            transactionDate.setMilliseconds(0)

            // Extrai o dia e o mês do detailing (dd/mm)
            const detailingParts = detailing.split(' ')[0].split('/')
            if (detailingParts.length === 2) {
               const detailingDay = parseInt(detailingParts[0], 10)
               const detailingMonth = parseInt(detailingParts[1], 10)

               // Verifica se o dia e o mês extraídos são válidos
               if (
                  !isNaN(detailingDay) &&
                  !isNaN(detailingMonth) &&
                  detailingDay >= 1 &&
                  detailingDay <= 31 &&
                  detailingMonth >= 1 &&
                  detailingMonth <= 12
               ) {
                  // Define o dia e o mês da transactionDate com base no detailing
                  transactionDate.setDate(detailingDay)
                  transactionDate.setMonth(detailingMonth - 1)
               } else {
                  console.warn('Linha ignorada por conter uma data inválida no detailing:', row)
               }
            } else {
               console.warn('Linha ignorada por conter um formato inválido no detailing:', row)
            }
         }

         transactionDate = new Date(transactionDate.getTime() - transactionDate.getTimezoneOffset() * 60000)

         try {
            await prisma.$transaction(async (prisma) => {
               const costCenterBankTransaction = await prisma.costCenter.findFirst({
                  where: {
                     name: {
                        contains: 'Transações Bancárias',
                        mode: 'insensitive',
                     },
                  },
               })
               const costCenterId = costCenterBankTransaction?.id || null

               // 1. Cria a transação bancária
               await prisma.bankTransactions.create({
                  data: {
                     bankAccountId,
                     description: historic,
                     amount: transactionValue,
                     detailing,
                     type: transactionType,
                     transactionAt: transactionDate,
                     csv: true,
                     csvFileName: filename,
                  },
               })

               // 2. Atualiza o saldo bancário
               currentBalance = transactionType === TransactionType.CREDIT ? currentBalance + transactionValue : currentBalance - transactionValue

               // 3. Cria a movimentação no fluxo de caixa
               await prisma.cashFlow.create({
                  data: {
                     date: transactionDate,
                     historic,
                     value: transactionValue,
                     type: transactionType,
                     description: detailing,
                     balance: currentBalance,
                     bankAccountId,
                     costCenterId,
                     csvFileName: filename,
                  },
               })
            })
         } catch (error) {
            console.error('Erro ao processar a linha:', row, error)
         }
      }

      // 5. Recalcula os saldos bancários e fluxos de caixa a partir da data da primeira transação do CSV
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
               csvFileName: filename, // Garante que estamos atualizando apenas os fluxos de caixa corretos
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

         await prisma.bankBalance.update({
            where: {
               id: bankBalance.id,
            },
            data: {
               balance: recalculateBalance,
            },
         })
      }
   } catch (error) {
      console.error('Erro ao importar transações:', error)
      throw new AppError('Erro ao importar transações bancárias.', 500)
   }
}
