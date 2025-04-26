import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { UserRole } from '@/models/user.model'
import { PrismaClient } from '@prisma/client'

interface AuthenticatedRequest extends FastifyRequest {
   user?: { id: string; role: UserRole }
}

const prisma = new PrismaClient()

export const authMiddleware: any = async (request: AuthenticatedRequest, reply: FastifyReply) => {
   const token = request.headers['authorization']?.split(' ')[1]

   if (!token) {
      return reply.status(401).send({ message: 'Token não fornecido' })
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { userId: string; role: UserRole }
      request.user = { id: decoded.userId, role: decoded.role }

      const user = await prisma.user.findFirst({ where: { id: decoded.userId } })

      if (!user) {
         return reply.status(401).send({ message: 'Usuário não encontrado' })
      }

      if (user.token !== token) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }
   } catch (error) {
      return reply.status(401).send({ message: 'Invalid token' })
   }
}
