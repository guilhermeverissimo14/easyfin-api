import { AppError } from '@/helpers/app-error'
import { getCostCenterAnalysisService } from '../services/reports/get-cost-center-analysis.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class ReportsController {
   constructor() {}

   public async getCostCenterAnalysis(
      request: FastifyRequest<{
         Querystring: {
            type?: 'C' | 'D'
            year?: string
         }
      }>, 
      reply: FastifyReply
   ) {
      try {
         const { type, year } = request.query
         const currentYear = new Date().getFullYear()
         const selectedYear = year ? parseInt(year) : currentYear

         if (selectedYear > currentYear) {
            throw new AppError('Não é possível consultar anos futuros', 400)
         }

         const analysis = await getCostCenterAnalysisService({ 
            type, 
            year: selectedYear 
         })
         
         return reply.status(200).send(analysis)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode || 400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new ReportsController()