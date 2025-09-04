import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { UserRole } from '@/models/user.model'
import { prisma } from '@/lib/prisma'

interface AuthenticatedRequest extends FastifyRequest {
   user?: { id: string; role: UserRole }
}

const userCache = new Map<string, { user: any, timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutos

export const authMiddleware: any = async (request: AuthenticatedRequest, reply: FastifyReply) => {
   const token = request.headers['authorization']?.split(' ')[1]

   if (!token) {
      return reply.status(401).send({ message: 'Token não fornecido' })
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { userId: string; role: UserRole }
      request.user = { id: decoded.userId, role: decoded.role }

      const cached = userCache.get(decoded.userId)
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
         if (cached.user.token !== token) {
            return reply.status(401).send({ message: 'Usuário não autenticado' })
         }
         return
      }

      const user = await prisma.user.findFirst({ where: { id: decoded.userId } })

      if (!user) {
         return reply.status(401).send({ message: 'Usuário não encontrado' })
      }

      if (user.token !== token) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      userCache.set(decoded.userId, { user, timestamp: Date.now() })
   } catch (error) {
      return reply.status(401).send({ message: 'Invalid token' })
   }
}
