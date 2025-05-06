import { PrismaClient } from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { formatCpfCnpj, formatPhone } from '@/utils/format'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const updateUserService = async (id: string, userData: any, userRole: string, userId: string) => {
   const user = await prisma.user.findUnique({ where: { id } })

   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   const processedData = { ...userData }

   if (processedData.cpfCnpj) {
      processedData.cpfCnpj = formatCpfCnpj(processedData.cpfCnpj)
   }

   if (processedData.phone) {
      processedData.phone = formatPhone(processedData.phone)
   }

   if (processedData.role) {
      const upperCaseRole = processedData.role.toUpperCase()

      // Verificar se é um valor válido
      if (Object.values(UserRole).includes(upperCaseRole)) {
         processedData.role = upperCaseRole
      } else {
         console.log(`Role inválida: ${processedData.role}, removendo do objeto`)
         delete processedData.role
      }
   }

   if (userRole === UserRole.ADMIN) {
      return await prisma.user.update({
         where: { id },
         data: processedData,
      })
   }

   throw new AppError('Acesso negado', 403)
}
