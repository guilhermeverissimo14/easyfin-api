import { PrismaClient} from '@prisma/client'
import { AppError } from '@/helpers/app-error'
import { UserRole } from '@/models/user.model'

const prisma = new PrismaClient()

export const getUserByIdService = async (id: string, userRole: string, userId: string) => {
   const user = await prisma.user.findUnique({ where: { id } })
   if (!user) {
      throw new AppError('Usuário não encontrado', 404)
   }

   if (userRole === UserRole.ADMIN) {

      const result = {
         ...user,
         role: user.role as UserRole,
        
      }

      return formatUserResponse(result)
   }


   throw new AppError('Acesso negado', 403)
}

const formatUserResponse = (user: any) => ({
   id: user.id,
   name: user.name,
   email: user.email,
   role: user.role,
   phone: user.phone,
   cpfCnpj: user.cpfCnpj,
   birthdate: user.birthdate,
   avatar: user.avatar,
   profileCompleted: user.profileCompleted,
   lastLogin: user.lastLogin,
   createdAt: user.createdAt,
   updatedAt: user.updatedAt,
})