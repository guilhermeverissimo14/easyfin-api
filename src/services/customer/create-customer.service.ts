import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { formatCpfCnpj, formatPhone } from '@/utils/format'

const prisma = new PrismaClient()

export const createCustomerService = async (customerData: {
   cnpj: string
   name: string
   email?: string | null
   phone?: string | null
   address?: string | null
   zipCode?: string | null
   city?: string | null
   state?: string | null
   country?: string | null
   contact?: string | null
   retIss?: boolean
}) => {
   const { cnpj, email } = customerData

   const existingCustomer = await prisma.customer.findUnique({ where: { cnpj } })

   if (existingCustomer) {
      throw new AppError('CNPJ já está cadastrado', 400)
   }

   if (email) {
      const existingEmail = await prisma.customer.findUnique({ where: { email } })
      if (existingEmail) {
         throw new AppError('E-mail já está em uso', 400)
      }
   }

   if (customerData.cnpj) {
      customerData.cnpj = formatCpfCnpj(customerData.cnpj)
   }

   if (customerData.phone) {
      customerData.phone = formatPhone(customerData.phone)
   }

   if (customerData.zipCode) {
      customerData.zipCode = customerData.zipCode.replace(/\D/g, '')
   }

   try {
      const customer = await prisma.customer.create({
         data: {
            ...customerData,
         },
      })

      return customer
   } catch (error) {
      console.error(error)
      throw new AppError('Erro ao criar o cliente', 500)
   }
}
