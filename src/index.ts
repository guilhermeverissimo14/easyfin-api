import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { authRoutes } from './routes/auth.routes'
import { healthRoutes } from './routes/health.routes'
import { userRoutes } from './routes/user.routes'
import { customerRoutes } from './routes/customer.routes'
import { supplierRoutes } from './routes/supplier.routes'
import { taxRatesRoutes } from './routes/tax-rates.routes'
import { paymentTermsRoutes } from './routes/payment-term.routes'
import { costCenterRoutes } from './routes/cost-center.routes'
import { bankAccountRoutes } from './routes/bank-account.routes'
import { paymentMethodsRoutes } from './routes/payment-method.routes'

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
      tags: [
         { name: 'Health', description: 'Verifica se a API está funcionando' },
         { name: 'Auth', description: 'Autenticação' },
         { name: 'User', description: 'Usuários' },
         { name: 'Customer', description: 'Clientes' },
         { name: 'Supplier', description: 'Fornecedores' },
         { name: 'Tax Rate', description: 'Alíquotas' },
         { name: 'Payment Term', description: 'Condições de pagamento' },
         { name: 'Cost Center', description: 'Centros de custo' },
         { name: 'Bank Account', description: 'Contas bancárias' },
      ],
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
      docExpansion: 'none',
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
server.register(customerRoutes, { prefix: '/api/customers' })
server.register(supplierRoutes, { prefix: '/api/suppliers' })
server.register(taxRatesRoutes, { prefix: '/api/tax-rates' })
server.register(paymentTermsRoutes, { prefix: '/api/payment-terms' })
server.register(costCenterRoutes, { prefix: '/api/cost-centers' })
server.register(bankAccountRoutes, { prefix: '/api/bank-accounts' })
server.register(paymentMethodsRoutes, { prefix: '/api/payment-methods' })

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
