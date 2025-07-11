import { PrismaClient } from '@prisma/client'
import { UserRole } from '@/models/user.model'
import { AppError } from '@/helpers/app-error'
import { Users } from '@/controllers/user.controller'

const prisma = new PrismaClient()

export const listUsersService = async (userId: string, userRole: UserRole): Promise<Users[]> => {
   if (userRole === UserRole.ADMIN) {
      const users = await prisma.user.findMany({
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            cpfCnpj: true,
            birthdate: true,
            avatar: true,
            active: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
         },
      })

      const result = users.map((user) => ({
         ...user,
         role: user.role as UserRole,
      }))

      return result as Users[]
   }

   throw new AppError('Permissão negada', 403)
}
