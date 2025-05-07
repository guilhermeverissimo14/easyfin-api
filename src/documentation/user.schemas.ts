export const createUserSchema = {
   description: 'Cria um novo usuário',
   tags: ['User'],
   body: {
      type: 'object',
      properties: {
         name: { type: 'string' },
         email: { type: 'string', format: 'email' },
         password: { type: 'string', minLength: 6, maxLength: 24, nullable: true },
         role: { type: 'string', enum: ['admin', 'user'] },
         phone: { type: 'string', nullable: true },
         cpfCnpj: { type: 'string', nullable: true },
         birthdate: { type: 'string', format: 'date', nullable: true },
      },
      required: ['name', 'email', 'role'],
   },
   response: {
      201: {
         description: 'Usuário criado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
            cpfCnpj: { type: 'string', nullable: true },
            birthdate: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            id: '87c96fc5-41d5-4e8a-9b73-35f5c19e9cc6',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            phone: '(31) 99876-5432',
            cpfCnpj: '123.456.789-01',
            birthdate: '1990-01-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         },
      },
      400: {
         description: 'Erro na validação dos dados',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'E-mail já está em uso',
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Não autorizado',
         },
      },
      500: {
         description: 'Erro ao criar o usuário',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao criar o usuário',
         },
      },
   },
}

export const listUsersSchema = {
   description: 'Lista os usuários',
   tags: ['User'],
   response: {
      200: {
         description: 'Usuários listados com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string' },
               name: { type: 'string' },
               email: { type: 'string' },
               role: { type: 'string' },
               phone: { type: 'string', nullable: true },
               cpfCnpj: { type: 'string', nullable: true },
               birthdate: { type: 'string', format: 'date', nullable: true },
               avatar: { type: 'string', nullable: true },
               active: { type: 'boolean' },
               profileCompleted: { type: 'boolean', nullable: true },
               lastLogin: { type: 'string', format: 'date-time', nullable: true },
               createdAt: { type: 'string', format: 'date-time' },
               updatedAt: { type: 'string', format: 'date-time' },
            },
            example: [
               {
                  id: '87c96fc5-41d5-4e8a-9b73-35f5c19e9cc6',
                  name: 'John Doe',
                  email: 'johndoe@email.com',
                  role: 'USER',
                  phone: '(31) 99876-5432',
                  cpfCnpj: '123.456.789-01',
                  birthdate: '1990-01-01',
                  avatar: 'avatar-01',
                  active: true,
                  profileCompleted: true,
                  lastLogin: '2025-02-10T00:00:00.000Z',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
               },
            ],
         },
         401: {
            description: 'Não autorizado',
            type: 'object',
            properties: {
               message: { type: 'string' },
            },
            example: {
               message: 'Não autorizado',
            },
         },
         403: {
            description: 'Acesso negado',
            type: 'object',
            properties: {
               message: { type: 'string' },
            },
            example: {
               message: 'Acesso negado',
            },
         },
         500: {
            description: 'Erro ao listar os usuários',
            type: 'object',
            properties: {
               message: { type: 'string' },
            },
            example: {
               message: 'Erro ao listar os usuários',
            },
         },
      },
   },
}

export const listUserById = {
   description: 'Lista um usuário',
   tags: ['User'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
   },
   response: {
      200: {
         description: 'Usuário listado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
            cpfCnpj: { type: 'string', nullable: true },
            birthdate: { type: 'string', format: 'date', nullable: true },
            avatar: { type: 'string', nullable: true },
            active: { type: 'boolean' },
            profileCompleted: { type: 'boolean', nullable: true },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time ' },
         },
         example: {
            id: '87c96fc5-41d5-4e8a-9b73-35f5c19e9cc6',
            name: 'John Doe',
            email: 'johndoe@email.com',
            role: 'USER',
            phone: '(31) 99876-5432',
            cpfCnpj: '123.456.789-01',
            birthdate: '1990-01-01',
            avatar: 'avatar-01',
            active: true,
            profileCompleted: true,
            lastLogin: '2025-02-10T00:00:00.000Z',
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Não autorizado',
         },
      },
      403: {
         description: 'Acesso negado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Acesso negado',
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
         description: 'Erro ao listar o usuário',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao listar o usuário',
         },
      },
   },
}

export const updateUserSchema = {
   description: 'Atualiza um usuário',
   tags: ['User'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
   },
   body: {
      type: 'object',
      properties: {
         name: { type: 'string', nullable: true },
         email: { type: 'string', format: 'email', nullable: true },
         role: { type: 'string', enum: ['admin', 'user'], nullable: true },
         phone: { type: 'string', nullable: true },
         cpfCnpj: { type: 'string', nullable: true },
         birthdate: { type: 'string', format: 'date-time', nullable: true },
         avatar: { type: 'string', nullable: true },
      },
   },
   response: {
      200: {
         description: 'Usuário atualizado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
            cpfCnpj: { type: 'string', nullable: true },
            birthdate: { type: 'string', format: 'date-time', nullable: true },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            id: '87c96fc5-41d5-4e8a-9b73-35f5c19e9cc6',
            name: 'John Doe',
            email: 'johndoe@email.com',
            role: 'USER',
            phone: '(31) 99876-5432',
            cpfCnpj: '123.456.789-01',
            birthdate: '1990-01-01',
            avatar: 'avatar-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         },
      },
      400: {
         description: 'Erro na validação dos dados',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'E-mail já está em uso',
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Não autorizado',
         },
      },
      403: {
         description: 'Acesso negado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Acesso negado',
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
         description: 'Erro ao atualizar o usuário',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao atualizar o usuário',
         },
      },
   },
}

export const toogleUserStatusSchema = {
   description: 'Ativa ou desativa um usuário',
   tags: ['User'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
   },
   response: {
      200: {
         description: 'Usuário atualizado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
            cpfCnpj: { type: 'string', nullable: true },
            birthdate: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            id: '87c96fc5-41d5-4e8a-9b73-35f5c19e9cc6',
            name: 'John Doe',
            email: 'johndoe@email.com',
            role: 'USER',
            phone: '(31) 99876-5432',
            cpfCnpj: '123.456.789-01',
            birthdate: '1990-01-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         },
      },
      401: {
         description: 'Não autorizado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Não autorizado',
         },
      },
      403: {
         description: 'Acesso negado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Acesso negado',
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
         description: 'Erro ao atualizar o usuário',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao atualizar o usuário',
         },
      },
   },
}
