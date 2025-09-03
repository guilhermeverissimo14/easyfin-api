export function parseValueBR(value: string): number {
   if (!value || typeof value !== 'string') return 0
   
   const cleanValue = value.trim().replace(/\s/g, '')
   
   if (cleanValue.includes(',')) {
      const lastCommaIndex = cleanValue.lastIndexOf(',')
      const integerPart = cleanValue.substring(0, lastCommaIndex).replace(/\./g, '')
      const decimalPart = cleanValue.substring(lastCommaIndex + 1)
      
      const americanFormat = `${integerPart}.${decimalPart}`
      return parseFloat(americanFormat) || 0
   }

   if (cleanValue.includes('.')) {
      const parts = cleanValue.split('.')
      
      if (parts.length === 2 && parts[1].length <= 2) {
         return parseFloat(cleanValue) || 0
      }
      
      return parseFloat(cleanValue.replace(/\./g, '')) || 0
   }
   
   return parseFloat(cleanValue) || 0
}

export function excelSerialToDate(serial: number): Date {
   const excelEpoch = new Date(1900, 0, 1)
   const days = serial - 2
   const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
   return date
}

export function parseDate(dateValue: any): string {
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