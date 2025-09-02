import { AppError } from '@/helpers/app-error'
import { getDashboardOverviewService } from '../services/dashboard/get-dashboard-overview.service'
import { getDashboardChartsService } from '../services/dashboard/get-dashboard-charts.service'
import { getDashboardTopCustomersService } from '../services/dashboard/get-dashboard-top-customers.service'
import { getDashboardTopSuppliersService } from '../services/dashboard/get-dashboard-top-suppliers.service'
import { getDashboardRecentTransactionsService } from '../services/dashboard/get-dashboard-recent-transactions.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class DashboardController {
   constructor() {}

   public async getOverview(
      request: FastifyRequest<{
         Querystring: {
            month?: string
         }
      }>, 
      reply: FastifyReply
   ) {
      try {
         const { month } = request.query
         const overview = await getDashboardOverviewService({ month })
         return reply.status(200).send(overview)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getCharts(
      request: FastifyRequest<{
         Querystring: {
            period?: 'week' | 'month' | 'quarter' | 'year'
            startDate?: string
            endDate?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { period = 'month', startDate, endDate } = request.query

         const charts = await getDashboardChartsService({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
         })

         return reply.status(200).send(charts)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getTopCustomers(
      request: FastifyRequest<{
         Querystring: {
            limit?: string
            period?: 'month' | 'quarter' | 'year'
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { limit = '10', period = 'year' } = request.query

         const topCustomers = await getDashboardTopCustomersService({
            limit: parseInt(limit),
            period,
         })

         return reply.status(200).send(topCustomers)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getTopSuppliers(
      request: FastifyRequest<{
         Querystring: {
            limit?: string
            period?: 'month' | 'quarter' | 'year'
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { limit = '10', period = 'year' } = request.query

         const topSuppliers = await getDashboardTopSuppliersService({
            limit: parseInt(limit),
            period,
         })

         return reply.status(200).send(topSuppliers)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getRecentTransactions(
      request: FastifyRequest<{
         Querystring: {
            limit?: string
            type?: 'all' | 'payable' | 'receivable' | 'cash-flow'
         }
      }>,
      reply: FastifyReply,
   ) {
      try {
         const { limit = '20', type = 'all' } = request.query

         const recentTransactions = await getDashboardRecentTransactionsService({
            limit: parseInt(limit),
            type,
         })

         return reply.status(200).send(recentTransactions)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new DashboardController()
