export const loginSchema = {
   description: 'Realiza o login do usuário',
   tags: ['Auth'],
   body: {
      type: 'object',
      properties: {
         email: { type: 'string' },
         password: { type: 'string' },
      },
      required: ['email', 'password'],
   },
   response: {
      200: {
         description: 'Login bem-sucedido',
         type: 'object',
         properties: {
            token: { type: 'string' },
            user: {
               type: 'object',
               properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  phone: { type: 'string' },
                  cpfCnpj: { type: 'string' },
                  avatar: { type: 'string' },
                  lastLogin: { type: 'string' },
               },
            },
         },
         example: {
            token: 'token_jwt',
            user: {
               id: 'f4b3c1d3-4b3c-4b3c-a4b3-c1d34b3c1d3',
               name: 'Minas Drones',
               email: 'minasdrones.crm@gmail.com',
               role: 'ADMIN',
               phone: '(31) 99999-9999',
               cpfCnpj: '123.456.789-00',
               avatar: 'avatar-01',
               lastLogin: '2025-02-10T00:00:00.000Z',
            },
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'E-mail ou senha inválidos',
         },
      },
      403: {
         description: 'Proibido. Usuário bloqueado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Usuário bloqueado. Entre em contato com o suporte.',
         },
      },
      404: {
         description: 'Usuário não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Usuário não encontrado',
         },
      },
      500: {
         description: 'Erro ao realizar login',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao realizar login',
         },
      },
   },
}

export const forgotPasswordSchema = {
   description: 'Solicita a redefinição da senha do usuário',
   tags: ['Auth'],
   body: {
      type: 'object',
      properties: {
         email: { type: 'string' },
      },
      required: ['email'],
   },
   response: {
      200: {
         description: 'E-mail de recuperação enviado com sucesso',
         example: {
            message: 'E-mail de recuperação enviado com sucesso',
         },
      },
      400: {
         description: 'Erro na validação dos dados',
         example: {
            message: 'Formato de e-mail inválido',
         },
      },
      404: {
         description: 'Usuário não encontrado',
         example: {
            message: 'Usuário não encontrado',
         },
      },
      500: {
         description: 'Erro ao enviar e-mail de recuperação',
         example: {
            message: 'Erro ao enviar e-mail de recuperação',
         },
      },
   },
}

export const resetPasswordSchema = {
   description: 'Redefine a senha do usuário',
   tags: ['Auth'],
   body: {
      type: 'object',
      properties: {
         email: { type: 'string' },
         code: { type: 'string' },
         newPassword: { type: 'string' },
      },
      required: ['email', 'code', 'newPassword'],
   },
   response: {
      200: {
         description: 'Senha alterada com sucesso',
         example: {
            message: 'Senha alterada com sucesso',
         },
      },
      400: {
         description: 'Código de recuperação inválido',
         example: {
            message: 'Código de recuperação inválido',
         },
      },
      404: {
         description: 'Usuário não encontrado',
         example: {
            message: 'Usuário não encontrado',
         },
      },
      500: {
         description: 'Erro ao redefinir a senha',
         example: {
            message: 'Erro ao redefinir a senha',
         },
      },
   },
}

export const refreshTokenSchema = {
   description: 'Atualiza o token de autenticação',
   tags: ['Auth'],
   body: {
      type: 'object',
      properties: {
         token: { type: 'string' },
      },
      required: ['token'],
   },
   response: {
      200: {
         description: 'Token atualizado com sucesso',
         example: {
            token: 'token_jwt',
         },
      },
      400: {
         description: 'Token inválido',
         example: {
            message: 'Token inválido',
         },
      },
      401: {
         description: 'Token expirado',
         example: {
            message: 'Token expirado',
         },
      },
      500: {
         description: 'Erro ao atualizar o token',
         example: {
            message: 'Erro ao atualizar o token',
         },
      },
   },
}

export const verifyCodeSchema = {
   description: 'Verifica o código de recuperação de senha',
   tags: ['Auth'],
   body: {
      type: 'object',
      properties: {
         email: { type: 'string' },
         code: { type: 'string' },
      },
      required: ['email', 'code'],
   },
   response: {
      200: {
         description: 'Código validado com sucesso',
         example: {
            message: 'Código validado com sucesso',
         },
      },
      400: {
         description: 'Código de recuperação inválido',
         example: {
            message: 'Código de recuperação inválido',
         },
      },
      404: {
         description: 'Usuário não encontrado',
         example: {
            message: 'Usuário não encontrado',
         },
      },
      500: {
         description: 'Erro ao validar o código',
         example: {
            message: 'Erro ao validar o código',
         },
      },
   },
}
