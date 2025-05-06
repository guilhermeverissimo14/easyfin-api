export const createCustomerSchema = {
   description: 'Cria um novo cliente',
   tags: ['Customer'],
   body: {
      type: 'object',
      properties: {
         cnpj: { type: 'string' },
         name: { type: 'string' },
         email: { type: 'string', format: 'email', nullable: true },
         phone: { type: 'string', nullable: true },
         address: { type: 'string', nullable: true },
         zipCode: { type: 'string', nullable: true },
         city: { type: 'string', nullable: true },
         state: { type: 'string', nullable: true },
         country: { type: 'string', nullable: true },
         contact: { type: 'string', nullable: true },
         retIss: { type: 'boolean', default: false },
      },
      required: ['cnpj', 'name'],
   },
   response: {
      201: {
         description: 'Cliente criado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            cnpj: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            zipCode: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            contact: { type: 'string', nullable: true },
            retIss: { type: 'boolean' },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
         },
         example: {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            cnpj: '12.345.678/0001-90',
            name: 'Empresa Exemplo Ltda',
            email: 'contato@empresaexemplo.com.br',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123',
            zipCode: '01234-567',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil',
            contact: 'João da Silva',
            retIss: false,
            active: true,
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
            message: 'CNPJ já está cadastrado',
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
         description: 'Erro ao criar o cliente',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao criar o cliente',
         },
      },
   },
}

export const updateCustomerSchema = {
   description: 'Atualiza um cliente existente',
   tags: ['Customer'],
   body: {
      type: 'object',
      properties: {
         cnpj: { type: 'string' },
         name: { type: 'string' },
         email: { type: 'string', format: 'email', nullable: true },
         phone: { type: 'string', nullable: true },
         address: { type: 'string', nullable: true },
         zipCode: { type: 'string', nullable: true },
         city: { type: 'string', nullable: true },
         state: { type: 'string', nullable: true },
         country: { type: 'string', nullable: true },
         contact: { type: 'string', nullable: true },
         retIss: { type: 'boolean', default: false },
      },
      required: [],
   },
   response: {
      200: {
         description: 'Cliente atualizado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            cnpj: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            zipCode: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            contact: { type: 'string', nullable: true },
            retIss: { type: 'boolean' },
            active: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
         },
         example: {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            cnpj: '12.345.678/0001-90',
            name: 'Empresa Exemplo Ltda',
            email: 'contato@empresaexemplo.com.br',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123',
            zipCode: '01234-567',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil',
            contact: 'João da Silva',
            retIss: false,
            active: true,
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
            message: 'CNPJ já está cadastrado',
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
         description: 'Permissão negada',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Permissão negada',
         },
      },
      404: {
         description: 'Cliente não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Cliente não encontrado',
         },
      },
      500: {
         description: 'Erro ao atualizar o cliente',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao atualizar o cliente',
         },
      },
   },
}

export const getCustomerByIdSchema = {
   description: 'Busca um cliente pelo ID',
   tags: ['Customer'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Cliente encontrado',
         type: 'object',
         properties: {
            id: { type: 'string' },
            cnpj: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            zipCode: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            contact: { type: 'string', nullable: true },
            retIss: { type: 'boolean' },
            active: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
         },
         example: {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            cnpj: '12.345.678/0001-90',
            name: 'Empresa Exemplo Ltda',
            email: 'contato@empresaexemplo.com.br',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123',
            zipCode: '01234-567',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil',
            contact: 'João da Silva',
            retIss: false,
            active: true,
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
         description: 'Permissão negada',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Permissão negada',
         },
      },
      404: {
         description: 'Cliente não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Cliente não encontrado',
         },
      },
      500: {
         description: 'Erro ao buscar o cliente',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao buscar o cliente',
         },
      },
   },
}

export const listCustomersSchema = {
   description: 'Lista todos os clientes',
   tags: ['Customer'],
   response: {
      200: {
         description: 'Lista de clientes',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string' },
               cnpj: { type: 'string' },
               name: { type: 'string' },
               email: { type: 'string', format: 'email', nullable: true },
               phone: { type: 'string', nullable: true },
               address: { type: 'string', nullable: true },
               zipCode: { type: 'string', nullable: true },
               city: { type: 'string', nullable: true },
               state: { type: 'string', nullable: true },
               country: { type: 'string', nullable: true },
               contact: { type: 'string', nullable: true },
               retIss: { type: 'boolean' },
               active: { type: 'boolean' },
               createdAt: { type: 'string' },
               updatedAt: { type: 'string' },
            },
         },
         example: [
            {
               id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
               cnpj: '12.345.678/0001-90',
               name: 'Empresa Exemplo Ltda',
               email: 'contato@empresaexemplo.com.br',
               phone: '(11) 1234-5678',
               address: 'Rua Exemplo, 123',
               zipCode: '01234-567',
               city: 'São Paulo',
               state: 'SP',
               country: 'Brasil',
               contact: 'João da Silva',
               retIss: false,
               active: true,
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
            },
            {
               id: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
               cnpj: '98.765.432/0001-01',
               name: 'Outra Empresa Ltda',
               email: 'outraempresa@empresaexemplo.com.br',
               phone: '(21) 9876-5432',
               address: 'Avenida Exemplo, 456',
               zipCode: '98765-432',
               city: 'Rio de Janeiro',
               state: 'RJ',
               country: 'Brasil',
               contact: 'Maria da Silva',
               retIss: true,
               active: false,
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
         description: 'Permissão negada',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Permissão negada',
         },
      },
      500: {
         description: 'Erro ao buscar os clientes',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao buscar os clientes',
         },
      },
   },
}

export const toggleCustomerStatusSchema = {
   description: 'Ativa ou desativa um cliente existente',
   tags: ['Customer'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Cliente atualizado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string' },
            cnpj: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            zipCode: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            contact: { type: 'string', nullable: true },
            retIss: { type: 'boolean' },
            active: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
         },
         example: {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            cnpj: '12.345.678/0001-90',
            name: 'Empresa Exemplo Ltda',
            email: 'contato@empresaexemplo.com.br',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123',
            zipCode: '01234-567',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil',
            contact: 'João da Silva',
            retIss: false,
            active: true,
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
         description: 'Permissão negada',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Permissão negada',
         },
      },
      404: {
         description: 'Cliente não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Cliente não encontrado',
         },
      },
      500: {
         description: 'Erro ao atualizar o cliente',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao atualizar o cliente',
         },
      },
   },
}

export const deleteCustomerSchema = {
   description: 'Deleta um cliente existente',
   tags: ['Customer'],
   params: {
      type: 'object',
      properties: {
         id: { type: 'string' },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Cliente deletado com sucesso',
         type: 'object',
         properties: {},
         example: {},
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
         description: 'Permissão negada',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Permissão negada',
         },
      },
      404: {
         description: 'Cliente não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Cliente não encontrado',
         },
      },
      500: {
         description: 'Erro ao deletar o cliente',
         type: 'object',
         properties: {
            message: { type: 'string' },
         },
         example: {
            message: 'Erro ao deletar o cliente',
         },
      },
   },
}
