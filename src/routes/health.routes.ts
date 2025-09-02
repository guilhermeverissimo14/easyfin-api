import { FastifyPluginAsync } from 'fastify'
import { healthCheckSchema } from '@/documentation/health.schemas'
import { prisma } from '@/lib/prisma'

const healthRoutes: FastifyPluginAsync = async (server) => {
   // Rota para checagem de estado da aplicação
   server.get('/healthcheck', { schema: healthCheckSchema }, async (request, reply) => {
      const dbStatus = await prisma.$queryRaw`SELECT 1`
      reply.send({
         status: 'OK',
         message: 'Server is running successfully',
         database: dbStatus ? 'Connected' : 'Not Connected',
      })
   })
}

export { healthRoutes }
