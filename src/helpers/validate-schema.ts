import { ZodError, ZodSchema } from 'zod'
import { FastifyReply } from 'fastify'

export const validateSchema = async <T>(schema: ZodSchema<T>, data: T, reply: FastifyReply) => {
   try {
      await schema.parse(data)
   } catch (error) {
      if (error instanceof ZodError) {
         return reply.status(400).send({ message: error.errors.map((err) => err.message).join(', ') })
      }
      return reply.status(500).send({ message: 'Internal server error' })
   }
}
