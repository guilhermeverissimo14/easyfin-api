import { AppError } from '@/helpers/app-error'
import { validateSchema } from '@/helpers/validate-schema'
import { createSupplierSchema, updateSupplierSchema } from '@/schemas/supplier'
import { createSupplierService } from '@/services/supplier/create-supplier.service'
import { deleteSupplierService } from '@/services/supplier/delete-supplier..service'
import { getSupplierByIdService } from '@/services/supplier/get-supplier-by-id.service'
import { listSuppliersService } from '@/services/supplier/list-supplier.service'
import { toggleSupplierService } from '@/services/supplier/toggle-supplier.service'
import { updateSupplierService } from '@/services/supplier/update-supplier.service'
import { FastifyReply, FastifyRequest } from 'fastify'

export interface Supplier {
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

class SupplierController {
   constructor() {
      ;(this.create = this.create.bind(this)),
         (this.getById = this.getById.bind(this)),
         (this.list = this.list.bind(this)),
         (this.update = this.update.bind(this)),
         (this.toggleStatus = this.toggleStatus.bind(this)),
         (this.delete = this.delete.bind(this))
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
         createSupplierSchema,
         { cnpj: newCnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss },
         reply,
      )

      if (validationError) {
         return
      }

      try {
         const supplier = await createSupplierService({
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

         return reply.status(201).send(supplier)
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
         const supplier = await getSupplierByIdService(id)

         return reply.status(200).send(supplier)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
      }
   }

   public async list(request: FastifyRequest, reply: FastifyReply): Promise<Supplier[]> {
      const userId = request.user?.id
      const userRole = request.user?.role

      if (!userId || !userRole) {
         return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      try {
         const suppliers = await listSuppliersService(userId, userRole)

         if (suppliers.length === 0) {
            return reply.status(404).send({ message: 'Nenhum fornecedor encontrado' })
         }

         const response = suppliers.map((supplier) => ({
            id: supplier.id,
            cnpj: supplier.cnpj,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            zipCode: supplier.zipCode,
            city: supplier.city,
            state: supplier.state,
            country: supplier.country,
            contact: supplier.contact,
            retIss: supplier.retIss,
            active: supplier.active,
         }))

         return reply.send(response)
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
         updateSupplierSchema,
         { cnpj: newCnpj, name, email, phone, address, zipCode, city, state, country, contact, retIss },
         reply,
      )

      if (validationError) return

      try {
         const updatedSupplier = await updateSupplierService(
            id,
            {
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
            },
            userId,
            userRole,
         )
         return reply.send(updatedSupplier)
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(400).send({ message: error.message })
         } else {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
         }
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
         const updatedSupplier = await toggleSupplierService(id, userRole)
         return reply.send(updatedSupplier)
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
         await deleteSupplierService(id, userRole)
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

export default new SupplierController()
