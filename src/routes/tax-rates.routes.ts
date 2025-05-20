import TaxRatesController from '@/controllers/tax-rates.controller'
import {
   createTaxRateSchema,
   listTaxRateSchema,
   getTaxRateByIdSchema,
   updateTaxRateSchema,
   deleteTaxRateSchema,
} from '@/documentation/tax-rate.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const taxRatesRoutes: FastifyPluginAsync = async (server) => {
   //Rota para listar taxas
   server.get('/', { preHandler: authMiddleware, schema: listTaxRateSchema }, TaxRatesController.list)

   //Rota para criar taxa
   server.post('/', { preHandler: authMiddleware, schema: createTaxRateSchema }, TaxRatesController.create)

   //Rota para listar uma taxa
   server.get('/:id', { preHandler: authMiddleware, schema: getTaxRateByIdSchema }, TaxRatesController.getById)

   //Rota para atualizar uma taxa
   server.put('/:id', { preHandler: authMiddleware, schema: updateTaxRateSchema }, TaxRatesController.update)

   //Rota para deletar uma taxa
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteTaxRateSchema }, TaxRatesController.delete)
}

export { taxRatesRoutes }
