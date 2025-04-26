import { PrismaClient } from '@prisma/client'
import { UserRole } from '@/models/user.model'
import { AppError } from '@/helpers/app-error'
import { UsersManager } from '@/controllers/user.controller'

const prisma = new PrismaClient()

export const listUsersService = async (userId: string, userRole: UserRole): Promise<UsersManager[]> => {
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
            profileCompleted: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
         },
      })

      let localManagersIds: string[] = users.map((user: { role: UserRole; id: string }) => user.role === UserRole.LOCAL_MANAGER && user.id) as string[]
      localManagersIds = localManagersIds.filter(Boolean)



      const result = users.map((user) => ({
         ...user,
         role: user.role as UserRole,

      }))

      return result as UsersManager[]
   }

   if (userRole === UserRole.MANAGER) {
      const localManagers = await prisma.user.findMany({
         where: { role: UserRole.LOCAL_MANAGER },
      })

      const result = localManagers.map((manager) => ({
         id: manager.id,
         name: manager.name,
         email: manager.email,
         role: manager.role as UserRole,
         phone: manager.phone,
         cpfCnpj: manager.cpfCnpj,
         birthdate: manager.birthdate,
         avatar: manager.avatar,
         profileCompleted: manager.profileCompleted,
         lastLogin: manager.lastLogin,
      
      }))

      return result as UsersManager[]
   }

   if (userRole === UserRole.LOCAL_MANAGER) {
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
            profileCompleted: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
         },
      })

      return users.map((user) => ({
         ...user,
         role: user.role as UserRole,
      }))
   }

   throw new AppError('Permissão negada', 403)
}
