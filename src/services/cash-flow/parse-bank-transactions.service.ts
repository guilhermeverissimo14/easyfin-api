import { TransactionType } from '@prisma/client'
import * as XLSX from 'xlsx'
import { AppError } from '@/helpers/app-error'
import { parseValueBR, parseDate } from '@/utils/bank-transaction-parser'

interface ParseBankTransactionsServiceParams {
   sheetNumber?: number
   file: Buffer
   filename: string
}

export interface ParsedTransaction {
   date: string
   historic: string
   value: number
   type: TransactionType
   detailing: string
   originalRow: number
   costCenterId?: string
}

export interface ParseBankTransactionsResponse {
   filename: string
   sheetNumber: number
   totalRows: number
   validTransactions: ParsedTransaction[]
   invalidRows: Array<{
      row: number
      data: any[]
      reason: string
   }>
}

export const parseBankTransactionsService = async ({ 
   sheetNumber = 0, 
   file, 
   filename 
}: ParseBankTransactionsServiceParams): Promise<ParseBankTransactionsResponse> => {
   const workbook = XLSX.read(file, { type: 'buffer' })
   const sheetName = workbook.SheetNames[sheetNumber || 0]
   const sheet = workbook.Sheets[sheetName]
   const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 3 })

   if (!Array.isArray(data)) {
      throw new AppError('Dados da planilha em formato inválido.', 400)
   }

   if (data.length === 0) {
      throw new AppError('Arquivo XLSX vazio ou com formato inválido.', 400)
   }

   const validTransactions: ParsedTransaction[] = []
   const invalidRows: Array<{ row: number; data: any[]; reason: string }> = []

   for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 4

      if (!Array.isArray(row) || row.length < 5) {
         invalidRows.push({
            row: rowNumber,
            data: Array.isArray(row) ? row : [],
            reason: 'Linha com formato inválido - menos de 5 colunas'
         })
         continue
      }

      const [dateRaw, historicRaw, valueRaw, typeRaw, detailingRaw] = row as [any, string, string, string, string]
      
      let date: string
      try {
         date = parseDate(dateRaw)
      } catch (error) {
         invalidRows.push({
            row: rowNumber,
            data: row,
            reason: 'Data inválida'
         })
         continue
      }
      
      const historic = historicRaw?.toString().trim()
      const valueStr = valueRaw?.toString().trim()
      const type = typeRaw?.toString().trim()
      const detailing = detailingRaw?.toString().trim()

      if (!date || !historic || !valueStr || !type) {
         invalidRows.push({
            row: rowNumber,
            data: row,
            reason: 'Dados incompletos - campos obrigatórios vazios'
         })
         continue
      }

      const dateParts = date.split('/')
      if (dateParts.length !== 3) {
         invalidRows.push({
            row: rowNumber,
            data: row,
            reason: 'Formato de data inválido'
         })
         continue
      }

      const transactionType = type.trim().toUpperCase() === 'C' ? TransactionType.CREDIT : TransactionType.DEBIT
      const transactionValue = parseValueBR(valueStr) 

      if (isNaN(transactionValue) || transactionValue <= 0) {
         invalidRows.push({
            row: rowNumber,
            data: row,
            reason: 'Valor inválido ou zero'
         })
         continue
      }

      validTransactions.push({
         date,
         historic,
         value: transactionValue,
         type: transactionType,
         detailing,
         originalRow: rowNumber,
         costCenterId: row[5]?.toString().trim() || undefined
      })
   }

   return {
      filename,
      sheetNumber,
      totalRows: data.length,
      validTransactions,
      invalidRows
   }
}