import { PrismaClient, TransactionType } from '@prisma/client'
import * as XLSX from 'xlsx'
import { AppError } from '@/helpers/app-error'

const prisma = new PrismaClient()

interface ImportBankTransactionsServiceParams {
   sheetNumber?: number
   bankAccountId: string
   file: Buffer
   filename: string
}

export const importBankTransactionsService = async ({ sheetNumber = 0, bankAccountId, file, filename }: ImportBankTransactionsServiceParams) => {
   const workbook = XLSX.read(file, { type: 'buffer' })
   const sheetName = workbook.SheetNames[sheetNumber || 0]
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

   const firstRow = data[0] as [Date, string, number, string, string]
   if (!firstRow || !firstRow[0]) {
      throw new AppError('Arquivo CSV vazio ou com formato inválido.', 400)
   }

   const datePartsFirst = (firstRow[0] as any).split('/')
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

      const dateParts = (date as any).split('/')
      if (dateParts.length !== 3) {
         console.warn('Linha ignorada por conter uma data inválida:', row)
         continue
      }

      const baseDateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      const baseDate = new Date(`${baseDateStr}T03:00:00Z`)
      const baseDateKey = baseDateStr

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

      const transactionType = type.trim().toUpperCase() === 'C' ? TransactionType.CREDIT : TransactionType.DEBIT
      const transactionValue = Number(value) * 100

      if (isNaN(transactionValue) || transactionValue <= 0) {
         console.warn('Linha ignorada por conter um valor inválido:', row)
         continue
      }

      if (!transactionDate || isNaN(transactionDate.getTime())) {
         console.warn('Linha ignorada por conter uma data inválida:', row)
         continue
      }

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

            currentBalance = transactionType === TransactionType.CREDIT ? currentBalance + transactionValue : currentBalance - transactionValue

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

            importedLinesCount++
         })
      } catch (error) {
         console.error('Erro ao processar a linha:', row, error)
      }
   }

   if (importedLinesCount === 0) {
      throw new AppError(`Nenhuma linha da planilha [${sheetNumber + 1}] foi importada com sucesso. Verifique o formato e os dados do arquivo.`, 400)
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
}
