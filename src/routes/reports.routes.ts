import { FastifyPluginAsync } from 'fastify'
import reportsController from '@/controllers/reports.controller'
import { authMiddleware } from '@/middleware/auth.middleware'
import { getCostCenterAnalysisSchema } from '../documentation/reports.schemas'

const reportsRoutes: FastifyPluginAsync = async (server) => {
   server.addHook('preHandler', authMiddleware)

   server.get('/cost-center-analysis', { schema: getCostCenterAnalysisSchema }, reportsController.getCostCenterAnalysis)
}

export { reportsRoutes }