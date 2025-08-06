export const formatCpfCnpj = (cpfCnpj: string): string => {
   const cleaned = cpfCnpj.replace(/\D/g, '')

   if (cleaned.length === 11) {
      return cleaned
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
   } else if (cleaned.length === 14) {
      return cleaned
         .replace(/(\d{2})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1/$2')
         .replace(/(\d{4})(\d)$/, '$1-$2')
   }

   return cpfCnpj
}

export const formatPhone = (phone: string): string => {
   const cleaned = phone.replace(/\D/g, '')

   if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
   } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
   }

   return phone
}

export const formatCurrency = (value: number): string => {
   return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const formatDate = (date: Date): string => {
   return date.toLocaleDateString('pt-BR')
}

export const formatDateTime = (date: Date): string => {
   return date.toLocaleString('pt-BR')
}

export function setToStartOfDayUTC(date: Date) {
   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
}

export function setToEndOfDayUTC(date: Date) {
   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))
}

export function getTodayInBrazilTimezone(): Date {
   const now = new Date()
   const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
   return brazilTime
}
