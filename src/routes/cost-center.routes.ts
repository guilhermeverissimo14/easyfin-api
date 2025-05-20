import CostCenterController from '@/controllers/cost-center.controller'
import {
   createCostCenterSchema,
   deleteCostCenterSchema,
   getCostCenterByIdSchema,
   listCostCenterSchema,
   updateCostCenterSchema,
} from '@/documentation/cost-center.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'
import { FastifyPluginAsync } from 'fastify'

const costCenterRoutes: FastifyPluginAsync = async (server) => {
   //Rota para listar centros de custo
   server.get('/', { preHandler: authMiddleware, schema: listCostCenterSchema }, CostCenterController.list)

   //Rota para criar centro de custo
   server.post('/', { preHandler: authMiddleware, schema: createCostCenterSchema }, CostCenterController.create)

   //Rota para listar um centro de custo
   server.get('/:id', { preHandler: authMiddleware, schema: getCostCenterByIdSchema }, CostCenterController.getById)

   //Rota para atualizar um centro de custo
   server.put('/:id', { preHandler: authMiddleware, schema: updateCostCenterSchema }, CostCenterController.update)

   //Rota para deletar um centro de custo
   server.delete('/:id', { preHandler: authMiddleware, schema: deleteCostCenterSchema }, CostCenterController.delete)
}

export { costCenterRoutes }
