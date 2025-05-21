import { ZodError, ZodSchema } from 'zod'
import { FastifyReply } from 'fastify'

export const validateSchema = async <T>(schema: ZodSchema<T>, data: T, reply: FastifyReply) => {
   try {
      await schema.parse(data)
   } catch (error) {
      if (error instanceof ZodError) {
         reply.status(400).send({ message: error.errors.map((err) => err.message).join(', ') })
         return true
      }
      reply.status(500).send({ message: 'Internal server error' })
      return true
   }
}
