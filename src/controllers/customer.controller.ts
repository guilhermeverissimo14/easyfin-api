import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/helpers/app-error'
import { createCustomerService } from '@/services/customer/create-customer.service'
import { getCustomerByIdService } from '@/services/customer/get-customer-by-id.service'
import { listCustomersService } from '@/services/customer/list-customers.service'
import { updateCustomerService } from '@/services/customer/update-customer.service'
import { toggleCustomerStatusService } from '@/services/customer/toggle-customer-status.service'
import { deleteCustomerService } from '@/services/customer/delete-customer.service'
import { createCustomerSchema, updateCustomerSchema } from '@/schemas/customer'
import { validateSchema } from '@/helpers/validate-schema'

export interface Customers {
   id: string
   cnpj: string
   name: string
   email: string | null
   phone: string | null
   address: string | null
   zipCode: string | null
   city: string | null
   state: string | null
   country: string | null
   contact: string | null
   retIss: boolean
   active: boolean
   createdAt?: Date
   updatedAt?: Date
}

class CustomerController {
   constructor() {
      this.create = this.create.bind(this)
      this.getById = this.getById.bind(this)
      this.list = this.list.bind(this)
      this.update = this.update.bind(this)
      this.toggleStatus = this.toggleStatus.bind(this)
      this.delete = this.delete.bind(this)
   }

   public async create(
      request: FastifyRequest<{
         Body: {
            cnpj: string
            name: string
            email?: string
            phone?: string
            address?: string
            zipCode?: string
            city?: string
            state?: string
            country?: string
            contact?: string
            retIss?: boolean
         }
      }>,
      reply: FastifyReply,
   ) {
      const { cnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss } = request.body
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const newCnpj = cnpj.replace(/\D/g, '')

      const validationError = await validateSchema(
         createCustomerSchema,
         { cnpj: newCnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss },
         reply,
      )
      if (validationError) return

      try {
         const customer = await createCustomerService({
            cnpj,
            name,
            email,
            phone,
            address,
            zipCode,
            city,
            state,
            country,
            contact,
            retIss,
         })

         return reply.status(201).send(customer)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ error: 'Internal server error' })
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
         const customer = await getCustomerByIdService(id)
         return reply.send(customer)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao buscar o cliente' })
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply): Promise<Customers[]> {
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const customers = await listCustomersService(userId, userRole)

         if (customers.length === 0) {
            return reply.status(404).send({ message: 'Nenhum cliente encontrado' })
         }

         const response = customers.map((customer) => ({
            id: customer.id,
            cnpj: customer.cnpj,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            zipCode: customer.zipCode,
            city: customer.city,
            state: customer.state,
            country: customer.country,
            contact: customer.contact,
            retIss: customer.retIss,
            active: customer.active,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
         }))

         return reply.send(response)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ error: 'Internal server error' })
      }
   }

   public async update(
      request: FastifyRequest<{
         Params: { id: string }
         Body: {
            cnpj?: string
            name?: string
            email?: string
            phone?: string
            address?: string
            zipCode?: string
            city?: string
            state?: string
            country?: string
            contact?: string
            retIss?: boolean
         }
      }>,
      reply: FastifyReply,
   ) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params
      const { cnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss } = request.body

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const newCnpj = cnpj?.replace(/\D/g, '') || cnpj

      const validationError = await validateSchema(
         updateCustomerSchema,
         { cnpj: newCnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss },
         reply,
      )
      if (validationError) return

      try {
         const updatedCustomer = await updateCustomerService(
            id,
            { cnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss },
            userId,
            userRole,
         )
         return reply.send(updatedCustomer)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao atualizar o cliente' })
      }
   }

   public async toggleStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const userId = request.user?.id
      const userRole = request.user?.role
      const { id } = request.params

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const updatedCustomer = await toggleCustomerStatusService(id, userRole)
         return reply.send(updatedCustomer)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao atualizar o status do cliente' })
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
         await deleteCustomerService(id, userRole)
         return reply.status(204).send()
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Erro ao remover o cliente' })
      }
   }
}

export default new CustomerController()
