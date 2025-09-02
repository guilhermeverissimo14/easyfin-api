import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'
import { formatCpfCnpj, formatPhone } from '@/utils/format'
import { prisma } from '@/lib/prisma'

export const updateCustomerService = async (
   id: string,
   customerData: {
      cnpj?: string
      name?: string
      email?: string | null
      phone?: string | null
      address?: string | null
      zipCode?: string | null
      city?: string | null
      state?: string | null
      country?: string | null
      contact?: string | null
      retIss?: boolean
   },
   userId: string,
   userRole: string,
) => {
   try {
      const existingCustomer = await prisma.customer.findUnique({
         where: {
            id: id,
         },
      })

      if (!existingCustomer) {
         throw new AppError('Cliente não encontrado', 404)
      }

      if (userRole !== UserRole.ADMIN) {
         throw new AppError('Acesso negado', 403)
      }

      if (customerData.cnpj) {
         const existingCnpj = await prisma.customer.findUnique({ where: { cnpj: customerData.cnpj } })

         if (existingCnpj && existingCnpj.id !== id) {
            throw new AppError('CNPJ já está cadastrado', 400)
         }

         customerData.cnpj = formatCpfCnpj(customerData.cnpj)
      }

      if (customerData.email) {
         const existingEmail = await prisma.customer.findUnique({ where: { email: customerData.email } })

         if (existingEmail && existingEmail.id !== id) {
            throw new AppError('E-mail já está em uso', 400)
         }
      }

      if (customerData.phone) {
         customerData.phone = formatPhone(customerData.phone)
      }

      if (customerData.zipCode) {
         customerData.zipCode = customerData.zipCode.replace(/\D/g, '')
      }

      const updatedCustomer = await prisma.customer.update({
         where: {
            id: id,
         },
         data: {
            ...customerData,
         },
      })

      return updatedCustomer
   } catch (error) {
      if (error instanceof AppError) {
         throw error
      }
      console.error(error)
      throw new AppError('Erro ao atualizar o cliente', 500)
   }
}
