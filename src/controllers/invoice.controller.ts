// src/controllers/invoice.controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/helpers/app-error'
import { createInvoiceService } from '@/services/invoice/create-invoice.service'
import { updateInvoiceService } from '@/services/invoice/update-invoice.service'
import { CreateInvoiceRequest, ListInvoicesRequest, UpdateInvoiceRequest } from '@/models/invoice.model'
import { listInvoicesService } from '@/services/invoice/list-invoices.service'
import { getInvoiceByIdService } from '@/services/invoice/get-invoice-by-id.service'

class InvoiceController {
   async create(request: FastifyRequest<CreateInvoiceRequest>, reply: FastifyReply) {
      try {
         const { invoiceNumber, customerId, paymentConditionId, issueDate, serviceValue, retainsIss, bankAccountId, costCenterId, notes } =
            request.body
         const userId = request.user?.id

         const invoice = await createInvoiceService({
            invoiceNumber,
            customerId,
            paymentConditionId,
            issueDate,
            serviceValue,
            retainsIss,
            bankAccountId,
            costCenterId,
            notes,
            userId,
         })

         return reply.status(201).send(invoice)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }

         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
   }

   async update(request: FastifyRequest<UpdateInvoiceRequest>, reply: FastifyReply) {
      try {
         const { id } = request.params
         const { invoiceNumber, customerId, paymentConditionId, issueDate, serviceValue, retainsIss, bankAccountId, costCenterId, notes, userId } =
            request.body

         const updatedInvoice = await updateInvoiceService({
            id,
            invoiceNumber,
            customerId,
            paymentConditionId,
            issueDate,
            serviceValue,
            retainsIss,
            bankAccountId,
            costCenterId,
            notes,
            userId,
         })

         return reply.status(200).send(updatedInvoice)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }

         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
   }

   async list(request: FastifyRequest<ListInvoicesRequest>, reply: FastifyReply) {
      try {
         const { customerId, bankAccountId, issueDateStart, issueDateEnd } = request.query

         const invoices = await listInvoicesService({
            customerId,
            bankAccountId,
            issueDateStart: issueDateStart ? new Date(issueDateStart) : undefined,
            issueDateEnd: issueDateEnd ? new Date(issueDateEnd) : undefined,
         })

         return reply.status(200).send(invoices)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            console.error(error)
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
         const { id } = request.params

         const invoice = await getInvoiceByIdService(id)

         return reply.status(200).send(invoice)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }

         console.error(error)
         return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
   }
}

export default new InvoiceController()
