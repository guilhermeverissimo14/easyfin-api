import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/helpers/app-error'
import { createUserService } from '@/services/user/create-user.service'
import { createUserSchema, updateUserPasswordSchema } from '@/schemas/user'
import { updateUserSchema } from '@/schemas/user'
import { validateSchema } from '@/helpers/validate-schema'
import { UserRole } from '@/models/user.model'
import { listUsersService } from '@/services/user/list-users.service'
import { getUserByIdService } from '@/services/user/get-user-by-id.service'
import { updateUserService } from '@/services/user/update-user.service'
import { toggleUserStatusService } from '@/services/user/toggle-user-status.service'
import { updateUserPasswordService } from '@/services/user/update-user-password.service'

export interface Users {
   id: string
   name: string
   email: string
   role: UserRole
   phone: string | null
   cpfCnpj: string | null
   birthdate: Date | null
   avatar: string | null
   active: boolean
   lastLogin: Date | null
   createdAt?: Date
   updatedAt?: Date
}

class UserController {
   constructor() {
      this.create = this.create.bind(this)
      this.list = this.list.bind(this)
   }

   public async create(
      request: FastifyRequest<{
         Body: {
            name: string
            email: string
            password: string
            role: UserRole
            birthdate?: Date
            phone?: string
            cpfCnpj?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { name, email, password, role, phone, cpfCnpj } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      const newUserRole = role.toUpperCase() as UserRole

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createUserSchema, { name, email, password, role, phone, cpfCnpj }, reply)
      if (validationError) return

      try {
         const user = await createUserService({
            name,
            email,
            password,
            role: newUserRole,
            phone,
            cpfCnpj,
            userRole,
         })

         return reply.status(201).send(user)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ error: 'Internal server error' })
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply): Promise<Users[]> {
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const users = await listUsersService(userId, userRole)

         if (users.length === 0) {
            return reply.status(404).send({ message: 'Nenhum usuário encontrado' })
         }

         const response = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            cpfCnpj: user.cpfCnpj,
            birthdate: user.birthdate,
            avatar: user.avatar,
            active: user.active,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
         }))

         return reply.send(response)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ error: 'Internal server error' })
      }
   }

   public async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const user = await getUserByIdService(id, userRole, userId)
         return reply.send(user)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao buscar o usuário' })
      }
   }

   public async update(
      request: FastifyRequest<{
         Params: { id: string }
         Body: {
            name?: string
            email?: string
            phone?: string | null
            cpfCnpj?: string
            birthdate?: string | null
            role?: string
            avatar?: string | null
         }
      }>,
      reply: FastifyReply,
   ) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      const body = { ...request.body }

      const { name, email, phone, cpfCnpj, birthdate, role, avatar } = body

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(updateUserSchema, { name, email, phone, cpfCnpj, birthdate, role, avatar }, reply)
      if (validationError) return

      try {
         const updatedUser = await updateUserService(id, { name, email, phone, cpfCnpj, birthdate, role, avatar }, userRole, userId)
         return reply.send(updatedUser)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao atualizar o usuário' })
      }
   }

    public async updatePassword(
      request: FastifyRequest<{
         Body: {
            password: string
            newPassword: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { password, newPassword } = request.body
      const validationError = await validateSchema(
         updateUserPasswordSchema,
         {
            password,
            newPassword,
         },
         reply,
      )
      if (validationError) return
      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }
      try {
         const updatedUser = await updateUserPasswordService(userId, { password, newPassword }, userRole, userId)
         return reply.send(updatedUser)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao atualizar a senha' })
      }
   }

   public async toggleStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const updatedUser = await toggleUserStatusService(id, userRole, userId)
         return reply.send(updatedUser)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao atualizar o usuário' })
      }
   }
}

export default new UserController()
