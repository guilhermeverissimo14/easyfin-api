import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createTaxRateSchema, updateTaxRateSchema } from '@/schemas/tax-rate'
import { createTaxRateService } from '@/services/tax-rate/create-tax-rate.service'
import { deleteTaxRateService } from '@/services/tax-rate/delete-tax-rate.service'
import { getTaxRateByIdService } from '@/services/tax-rate/get-tax-rate-by-id.service'
import { listTaxRateService } from '@/services/tax-rate/list-tax-rate.service'
import { updateTaxRateService } from '@/services/tax-rate/update-tax-rate.service'
import { FastifyReply, FastifyRequest } from 'fastify'

class TaxRatesController {
   constructor() {}

   public async create(
      request: FastifyRequest<{
         Body: {
            year: number
            month: number
            issqnTaxRate: number
            effectiveTaxRate: number
         }
      }>,
      reply: FastifyReply,
   ) {
      const { year, month, issqnTaxRate, effectiveTaxRate } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(createTaxRateSchema, { year, month, issqnTaxRate, effectiveTaxRate }, reply)

      if (validationError) {
         return
      }

      try {
         const taxRate = await createTaxRateService({
            year,
            month,
            issqnTaxRate,
            effectiveTaxRate,
         })

         return reply.status(201).send(taxRate)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role

      const { id } = request.params

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const taxRates = await getTaxRateByIdService(id)

         return reply.status(200).send(taxRates)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const taxRates = await listTaxRateService()

         if (taxRates.length === 0) {
            return reply.status(404).send({ message: 'Nenhuma taxa encontrada' })
         }

         return reply.send(taxRates)
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
         Params: { id: string }
         Body: {
            year?: number
            month?: number
            issqnTaxRate?: number
            effectiveTaxRate?: number
         }
      }>,
      reply: FastifyReply,
   ) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      const { year, month, issqnTaxRate, effectiveTaxRate } = request.body

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(updateTaxRateSchema, { year, month, issqnTaxRate, effectiveTaxRate }, reply)

      if (validationError) return

      try {
         const updatedTaxRates = await updateTaxRateService(id, {
            year,
            month,
            issqnTaxRate,
            effectiveTaxRate,
         })
         return reply.send(updatedTaxRates)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         await deleteTaxRateService(id, userRole)
         return reply.status(204).send()
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }
}

export default new TaxRatesController()
