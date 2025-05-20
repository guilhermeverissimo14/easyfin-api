import { AppError } from '@/helpers/app-error'
import { createCostCenterService } from '@/services/cost-center/create-cost-center.service'
import { deleteCostCenterService } from '@/services/cost-center/delete-cost-center.service'
import { getCostCenterByIdService } from '@/services/cost-center/get-cost-center-by-id.service'
import { listCostCenterService } from '@/services/cost-center/list-cost-center.service'
import { updateCostCenterService } from '@/services/cost-center/update-cost-center.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class CostCenterController {
   constructor() {}

   public async create(
      request: FastifyRequest<{
         Body: {
            name: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { name } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const costCenter = await createCostCenterService({
            name,
         })

         return reply.status(201).send(costCenter)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply) {
      try {
         const costCenters = await listCostCenterService()
         return reply.status(200).send(costCenters)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getById(
      request: FastifyRequest<{
         Params: {
            id: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params

      try {
         const costCenter = await getCostCenterByIdService(id)
         return reply.status(200).send(costCenter)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async update(
      request: FastifyRequest<{
         Params: {
            id: string
         }
         Body: {
            name?: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const { name } = request.body
      const userRole = request.user?.role

      if (!userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const updatedCostCenter = await updateCostCenterService(id, { name })
         return reply.status(200).send(updatedCostCenter)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async delete(
      request: FastifyRequest<{
         Params: {
            id: string
         }
      }>,
      reply: FastifyReply,
   ) {
      const { id } = request.params
      const userRole = request.user?.role

      if (!userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         await deleteCostCenterService(id, userRole)
         return reply.status(204).send({ message: 'Centro de custo removido com sucesso' })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new CostCenterController()
