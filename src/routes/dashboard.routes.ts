import { FastifyPluginAsync } from 'fastify'
import dashboardController from '@/controllers/dashboard.controller'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
   getDashboardOverviewSchema,
   getDashboardChartsSchema,
   getDashboardTopCustomersSchema,
   getDashboardTopSuppliersSchema,
   getDashboardRecentTransactionsSchema,
} from '../documentation/dashboard.schemas'

const dashboardRoutes: FastifyPluginAsync = async (server) => {
   // Aplicar middleware de autenticação para todas as rotas
   server.addHook('preHandler', authMiddleware)

   // Rota para obter visão geral do dashboard
   server.get('/overview', { schema: getDashboardOverviewSchema }, dashboardController.getOverview)

   // Rota para obter dados de gráficos
   server.get('/charts', { schema: getDashboardChartsSchema }, dashboardController.getCharts)

   // Rota para obter top clientes
   server.get('/top-customers', { schema: getDashboardTopCustomersSchema }, dashboardController.getTopCustomers)

   // Rota para obter top fornecedores
   server.get('/top-suppliers', { schema: getDashboardTopSuppliersSchema }, dashboardController.getTopSuppliers)

   // Rota para obter transações recentes
   server.get('/recent-transactions', { schema: getDashboardRecentTransactionsSchema }, dashboardController.getRecentTransactions)
}

export { dashboardRoutes }
