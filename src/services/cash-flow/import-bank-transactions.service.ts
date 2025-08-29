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

// Função para converter valor brasileiro para número
function parseValueBR(value: string): number {
   if (!value || typeof value !== 'string') return 0
   
   // Remove espaços
   const cleanValue = value.trim()
   
   // Se não tem vírgula, é um valor inteiro (ex: "1000")
   if (!cleanValue.includes(',')) {
      return parseFloat(cleanValue.replace(/\./g, '')) || 0
   }
   
   // Se tem vírgula, separa a parte inteira da decimal
   const parts = cleanValue.split(',')
   if (parts.length !== 2) return 0
   
   // Remove pontos da parte inteira (separadores de milhares)
   const integerPart = parts[0].replace(/\./g, '')
   const decimalPart = parts[1]
   
   // Reconstrói no formato americano
   const americanFormat = `${integerPart}.${decimalPart}`
   
   return parseFloat(americanFormat) || 0
}

// Função para converter número serial do Excel para data
function excelSerialToDate(serial: number): Date {
   const excelEpoch = new Date(1900, 0, 1)
   const days = serial - 2 // Correção do bug do Excel
   const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
   return date
}

// Função para converter data (string ou número serial) para formato brasileiro
function parseDate(dateValue: any): string {
   if (typeof dateValue === 'number') {
      const date = excelSerialToDate(dateValue)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
   } else if (typeof dateValue === 'string') {
      return dateValue.trim()
   } else {
      throw new Error('Formato de data inválido')
   }
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

   // Converter a data usando a nova função
   const firstDateStr = parseDate(firstRow[0])
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

   for (const row of data) {
      if (!Array.isArray(row) || row.length < 5) {
         console.warn('Linha ignorada por ter um formato inválido:', row)
         continue
      }

      // Aplicar trim em todas as colunas e converter data
      const [dateRaw, historicRaw, valueRaw, typeRaw, detailingRaw] = row as [any, string, string, string, string]
      
      let date: string
      try {
         date = parseDate(dateRaw)
      } catch (error) {
         console.warn('Linha ignorada por conter uma data inválida:', row)
         continue
      }
      
      const historic = historicRaw?.toString().trim()
      const valueStr = valueRaw?.toString().trim()
      const type = typeRaw?.toString().trim()
      const detailing = detailingRaw?.toString().trim()

      if (!date || !historic || !valueStr || !type) {
         console.warn('Linha ignorada por conter dados incompletos:', row)
         continue
      }

      const dateParts = date.split('/')
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
      const transactionValue = parseValueBR(valueStr) * 100

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
