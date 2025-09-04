import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { updateSettingsSchema } from '@/schemas/settings'
import { listSettingsService } from '@/services/settings/list-settings.service'
import { updateSettingsService } from '@/services/settings/update-settings.service'
import { CashType } from '@prisma/client'

class SettingsController {
   constructor() {
      this.list = this.list.bind(this)
      this.update = this.update.bind(this)
   }

   public async list(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user?.id

      if (!userId) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const settings = await listSettingsService(userId)
         return reply.status(200).send(settings)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao recuperar as configurações' })
      }
   }

   public async update(request: FastifyRequest<{
      Body: {
         cashFlowDefault?: CashType
         bankAccountDefault?: string
         showClock?: boolean
      }
   }>, reply: FastifyReply) {
      const { cashFlowDefault, bankAccountDefault, showClock } = request.body
      const userId = request.user?.id

      if (!userId) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const validationError = await validateSchema(updateSettingsSchema, { cashFlowDefault, bankAccountDefault }, reply)

      if (validationError) return

      try {
         const updatedSettings = await updateSettingsService(userId, {
            cashFlowDefault,
            bankAccountDefault,
            showClock
         })
         return reply.status(200).send(updatedSettings)
      } catch (error) {
         console.error(error)
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         } else return reply.status(500).send({ message: 'Erro ao atualizar as configurações' })
      }
   }
}

export default new SettingsController()
