import { FastifyPluginAsync } from 'fastify'
import AuthController from '@/controllers/auth.controller'
import { loginSchema, forgotPasswordSchema, verifyCodeSchema, resetPasswordSchema, refreshTokenSchema } from '@/documentation/auth.schemas'
import { authMiddleware } from '@/middleware/auth.middleware'

const authRoutes: FastifyPluginAsync = async (server) => {
   // Rota para autenticação
   server.post('/login', { schema: loginSchema }, AuthController.handleLogin)

   // Rota para esqueci minha senha
   server.post('/forgot-password', { schema: forgotPasswordSchema }, AuthController.handleForgotPassword)

   // Rota para verificar código de recuperação
   server.post('/verify-code', { schema: verifyCodeSchema }, AuthController.handleVerifyCode)

   // Rota para redefinição de senha
   server.post('/reset-password', { schema: resetPasswordSchema }, AuthController.handleResetPassword)

   // Rota para refresh token
   server.post('/refresh-token', { preHandler: authMiddleware, schema: refreshTokenSchema }, AuthController.handleRefreshToken)
}

export { authRoutes }
