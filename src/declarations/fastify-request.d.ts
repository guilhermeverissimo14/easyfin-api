import { FastifyRequest } from 'fastify'
import { UserRole } from '@/models/user.model'

declare module 'fastify' {
   interface FastifyRequest {
      user?: {
         id: string
         role: UserRole
      }
      files?: () => AsyncGenerator<MultipartFile>
   }
}
