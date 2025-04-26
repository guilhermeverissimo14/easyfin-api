import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { authRoutes } from './routes/auth.routes'
import { healthRoutes } from './routes/health.routes'
import { userRoutes } from './routes/user.routes'

const server = Fastify()

server.register(cors, {
   origin: '*',
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
})

server.register(fastifySwagger, {
   swagger: {
      info: {
         title: 'API Easyfin',
         description: 'Documentação da API para o sistema Easyfin',
         version: '1.0.0',
      },
      host: process.env.BASE_URL || 'localhost:3333',
      schemes: process.env.BASE_URL ? ['https'] : ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
         BearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Bearer <token>',
         },
      },
      security: [
         {
            BearerAuth: [],
         },
      ],
   },
})

server.register(fastifySwaggerUi, {
   routePrefix: '/documentation',
   uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
   },
   uiHooks: {
      onRequest: function (request, reply, next) {
         next()
      },
      preHandler: function (request, reply, next) {
         next()
      },
   },
   staticCSP: true,
   transformStaticCSP: (header) => header,
   transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject
   },
   transformSpecificationClone: true,
})

server.get('/', async (request, reply) => {
   return { message: 'API Minas Drones está funcionando! 🚀' }
})

server.register(healthRoutes, { prefix: '/' })
server.register(authRoutes, { prefix: '/api/auth' })
server.register(userRoutes, { prefix: '/api/users' })

export const startServer = async () => {
   try {
      const PORT = process.env.PORT || 3333
      await server.listen({ port: Number(PORT), host: '0.0.0.0' })

      console.log(`Server running at http://localhost:${PORT} 🚀`)
      server.swagger()
   } catch (err) {
      console.log(err)
      process.exit(1)
   }
}

startServer()
