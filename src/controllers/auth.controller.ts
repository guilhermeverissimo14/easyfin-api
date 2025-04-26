import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/helpers/app-error'
import { loginService } from '@/services/auth/login.service'
import { resetPasswordService } from '@/services/auth/reset-password.service'
import { forgotPasswordSchema, loginSchema, refreshTokenSchema, resetPasswordSchema, validateCodeSchema } from '@/schemas/auth'
import { validateSchema } from '@/helpers/validate-schema'
import { forgotPasswordService } from '@/services/auth/forgot-password.service'
import { refreshTokenService } from '@/services/auth/refresh-token.service'
import { validateCodeService } from '@/services/auth/validate-code.service'

class AuthController {
   public async handleLogin(request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
      const { email, password } = request.body

      const validationError = await validateSchema(loginSchema, { email, password }, reply)
      if (validationError) {
         console.log('Erro de validação:', validationError);
         return;
      }

      try {

         const { token, user } = await loginService(email, password)
         return reply.send({ token, user })

      } catch (error) {
         console.error('Erro detalhado:', error);
         if (error instanceof AppError) {
            console.log('AppError detectado:', error.message, 'Status:', error.statusCode);
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Não foi possível realizar o login. Tente novamente mais tarde.' })
      }
   }

   public async handleForgotPassword(request: FastifyRequest, reply: FastifyReply) {
      const { email } = request.body as { email: string }

      const validationError = await validateSchema(forgotPasswordSchema, { email }, reply)
      if (validationError) return

      try {
         const message = await forgotPasswordService(email)
         return reply.send({ message })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Não foi possível enviar o e-mail de recuperação de senha. Tente novamente mais tarde.' })
      }
   }

   public async handleResetPassword(request: FastifyRequest, reply: FastifyReply) {
      const { email, code, newPassword } = request.body as { email: string; code: string; newPassword: string }

      const validationError = await validateSchema(resetPasswordSchema, { email, code, newPassword }, reply)
      if (validationError) return

      try {
         const message = await resetPasswordService(email, code, newPassword)
         return reply.send({ message })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Não foi possível redefinir a senha. Tente novamente mais tarde.' })
      }
   }

   public async handleRefreshToken(request: FastifyRequest, reply: FastifyReply) {
      const { token } = request.body as { token: string }

      const validationError = await validateSchema(refreshTokenSchema, { token }, reply)
      if (validationError) return

      try {
         const message = await refreshTokenService(token)
         return reply.send({ newToken: message })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Não foi possível atualizar o token. Tente novamente mais tarde.' })
      }
   }

   public async handleVerifyCode(request: FastifyRequest, reply: FastifyReply) {
      const { email, code } = request.body as { email: string; code: string }

      const validationError = await validateSchema(validateCodeSchema, { email, code }, reply)
      if (validationError) return

      try {
         const message = await validateCodeService(email, code)
         return reply.send({ message })
      } catch (error) {
         if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message })
         }
         return reply.status(500).send({ message: 'Não foi possível verificar o código. Tente novamente mais tarde.' })
      }
   }
}

export default new AuthController()
