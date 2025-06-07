export const createBankAccountSchema = {
   description: 'Cria uma nova conta bancária',
   tags: ['Bank Account'],
   summary: 'Criar conta bancária',
   body: {
      type: 'object',
      properties: {
         bank: {
            type: 'string',
            description: 'Nome do banco',
         },
         agency: {
            type: 'string',
            description: 'Número da agência',
         },
         account: {
            type: 'string',
            description: 'Número da conta',
         },
         type: {
            type: 'string',
            description: 'Tipo da conta (C - Corrente, P - Poupança)',
         },
      },
      required: ['bank', 'agency', 'account', 'type'],
   },
   response: {
      201: {
         description: 'Conta bancária criada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da conta bancária',
            },
            bank: {
               type: 'string',
               description: 'Nome do banco',
            },
            agency: {
               type: 'string',
               description: 'Número da agência',
            },
            account: {
               type: 'string',
               description: 'Número da conta',
            },
            type: {
               type: 'string',
               description: 'Tipo da conta (C - Corrente, P - Poupança)',
            },
            active: {
               type: 'boolean',
               description: 'Status da conta bancária (ativa/inativa)',
               default: true,
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da conta bancária',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da conta bancária',
            },
         },
         example: {
            id: 'uuid',
            bank: 'Banco do Brasil',
            agency: '1234',
            account: '56789-0',
            type: 'C',
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
         },
      },
      400: {
         description: 'Erro ao criar a conta bancária',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta bancária já cadastrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const updateBankAccountSchema = {
   description: 'Atualiza uma conta bancária existente',
   tags: ['Bank Account'],
   summary: 'Atualizar conta bancária',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta bancária a ser atualizada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         bank: {
            type: 'string',
            description: 'Nome do banco',
         },
         agency: {
            type: 'string',
            description: 'Número da agência',
         },
         account: {
            type: 'string',
            description: 'Número da conta',
         },
         type: {
            type: 'string',
            description: 'Tipo da conta (C - Corrente, P - Poupança)',
         },
         active: {
            type: 'boolean',
            description: 'Status da conta bancária (ativa/inativa)',
            default: true,
         },
      },
   },
   response: {
      200: {
         description: 'Conta bancária atualizada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da conta bancária',
               example: '1234567890abcdef12345678',
            },
            bank: {
               type: 'string',
               description: 'Nome do banco',
            },
            agency: {
               type: 'string',
               description: 'Número da agência',
            },
            account: {
               type: 'string',
               description: 'Número da conta',
            },
            type: {
               type: 'string',
               description: 'Tipo da conta (C - Corrente, P - Poupança)',
            },
            active: {
               type: 'boolean',
               description: 'Status da conta bancária (ativa/inativa)',
               default: true,
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da conta bancária',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da conta bancária',
            },
         },
      },
      400: {
         description: 'Erro ao atualizar a conta bancária',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta bancária não encontrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const listBankAccountSchema = {
   description: 'Retorna uma lista de todas as contas bancárias',
   tags: ['Bank Account'],
   summary: 'Listar todas as contas bancárias',
   response: {
      200: {
         description: 'Lista de contas bancárias retornada com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da condição de pagamento',
               },
               bank: {
                  type: 'string',
                  description: 'Nome do banco',
               },
               agency: {
                  type: 'string',
                  description: 'Número da agência',
               },
               account: {
                  type: 'string',
                  description: 'Número da conta',
               },
               type: {
                  type: 'string',
                  description: 'Tipo da conta (C - Corrente, P - Poupança)',
               },
               active: {
                  type: 'boolean',
                  description: 'Status da conta bancária (ativa/inativa)',
                  default: true,
               },
               createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de criação da conta bancária',
               },
               updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de atualização da conta bancária',
               },
            },
            example: [
               {
                  id: 'uuid',
                  bank: 'Banco do Brasil',
                  agency: '1234',
                  account: '56789-0',
                  type: 'C',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  bank: 'Itaú',
                  agency: '5678',
                  account: '12345-6',
                  type: 'P',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  bank: 'Santander',
                  agency: '9012',
                  account: '34567-8',
                  type: 'C',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
            ],
         },
      },
      404: {
         description: 'Nenhuma conta bancária encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Nenhuma conta bancária encontrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const getBankAccountByIdSchema = {
   description: 'Retorna uma conta bancária específica pelo ID',
   tags: ['Bank Account'],
   summary: 'Obter conta bancária por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta bancária a ser retornada',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Conta bancária encontrada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da taxa',
               example: '1234567890abcdef12345678',
            },
            bank: {
               type: 'string',
               description: 'Nome do banco',
               example: 'Banco do Brasil',
            },
            agency: {
               type: 'string',
               description: 'Número da agência',
               example: '1234',
            },
            account: {
               type: 'string',
               description: 'Número da conta',
               example: '56789-0',
            },
            type: {
               type: 'string',
               description: 'Tipo da conta (C - Corrente, P - Poupança)',
               example: 'C',
            },
            active: {
               type: 'boolean',
               description: 'Status da conta bancária (ativa/inativa)',
               default: true,
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da conta bancária',
               example: '2025-05-01T00:00:00Z',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da conta bancária',
               example: '2025-05-02T00:00:00Z',
            },
         },
         example: {
            id: 'uuid',
            bank: 'Banco do Brasil',
            agency: '1234',
            account: '56789-0',
            type: 'C',
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-02T00:00:00Z',
         },
      },
      404: {
         description: 'Conta bancária não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta bancária não encontrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}

export const deleteBankAccountSchema = {
   description: 'Deleta uma conta bancária específica pelo ID',
   tags: ['Bank Account'],
   summary: 'Deletar conta bancária por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da conta bancária a ser deletada',
         },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Conta bancária deletada com sucesso',
         type: 'null',
      },
      404: {
         description: 'Conta bancária não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta bancária não encontrada',
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Erro interno do servidor',
            },
         },
      },
   },
}
