import fastifyMultipart from '@fastify/multipart'

export const getTotalsPerDayCashFlowSchema = {
   description: 'Obtém os totais do fluxo de caixa por dia',
   tags: ['Cash Flow'],
   summary: 'Obter totais do fluxo de caixa por dia',
   response: {
      200: {
         description: 'Totais do fluxo de caixa por dia',
         type: 'object',
         properties: {
            date: {
               type: 'string',
               format: 'date',
               description: 'Data do fluxo de caixa',
               example: '2023-10-01',
            },
            bankName: {
               type: 'string',
               description: 'Nome do banco ou caixa',
               example: 'Banco Exemplo',
            },
            bankAccountInfo: {
               type: 'string',
               description: 'Informações da conta bancária ou caixa',
               example: 'Conta Corrente - Banco Exemplo',
            },
            totalEntries: {
               type: 'number',
               format: 'float',
               description: 'Total de entradas no fluxo de caixa',
               example: 1500.0,
            },
            totalExits: {
               type: 'number',
               format: 'float',
               description: 'Total de saídas no fluxo de caixa',
               example: 500.0,
            },
            balance: {
               type: 'number',
               format: 'float',
               description: 'Saldo final do fluxo de caixa no dia',
               example: 1000.0,
            },
         },
         example: {
            date: '2025-06-01',
            bankName: 'Banco Exemplo',
            bankAccountInfo: 'Agência - Conta Corrente',
            totalEntries: 1500.0,
            totalExits: 500.0,
            balance: 1000.0,
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
         },
      },
      404: {
         description: 'Caixa não encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Caixa não encontrado',
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

export const createCashFlowSchema = {
   description: 'Cria um novo lançamento no fluxo de caixa',
   tags: ['Cash Flow'],
   summary: 'Criar lançamento no fluxo de caixa',
   body: {
      type: 'object',
      properties: {
         date: {
            type: 'string',
            format: 'date-time',
            description: 'Data do lançamento no fluxo de caixa',
         },
         type: {
            type: 'string',
            enum: ['CREDIT', 'DEBIT'],
            description: 'Tipo do lançamento no fluxo de caixa',
         },
         value: {
            type: 'number',
            format: 'float',
            description: 'Valor do lançamento no fluxo de caixa',
         },
         historic: {
            type: 'string',
            description: 'Histórico do lançamento no fluxo de caixa',
         },
         description: {
            type: 'string',
            description: 'Descrição adicional do lançamento no fluxo de caixa',
         },
         costCenterId: {
            type: 'string',
            description: 'ID do centro de custo associado ao lançamento',
         },
         bankAccountId: {
            type: 'string',
            description:
               'ID da conta bancária associada ao lançamento, que estiver selecionada no Livro Caixa atual. Não deve ser modificado via formulário!',
         },
         cashBoxId: {
            type: 'string',
            description: 'ID do caixa associado ao lançamento, que estiver selecionado no Livro Caixa atual. Não deve ser modificado via formulário!',
         },
      },
   },
   response: {
      201: {
         description: 'Lançamento criado com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID do lançamento no fluxo de caixa',
               example: '1234567890abcdef12345678',
            },
            date: {
               type: 'string',
               format: 'date-time',
               description: 'Data do lançamento no fluxo de caixa',
               example: '2023-10-01T12:00:00Z',
            },
            type: {
               type: 'string',
               enum: ['CREDIT', 'DEBIT'],
               description: 'Tipo do lançamento no fluxo de caixa',
               example: 'CREDIT',
            },
            value: {
               type: 'number',
               format: 'float',
               description: 'Valor do lançamento no fluxo de caixa',
               example: 1000.0,
            },
            historic: {
               type: 'string',
               description: 'Histórico do lançamento no fluxo de caixa',
               example: 'Pagamento de fornecedor',
            },
            description: {
               type: 'string',
               description: 'Descrição adicional do lançamento no fluxo de caixa',
               example: 'Pagamento referente à compra de materiais',
            },
            costCenterId: {
               type: 'string',
               description: 'ID do centro de custo associado ao lançamento',
               example: '1234567890abcdef12345678',
            },
            bankAccountId: {
               type: 'string',
               description:
                  'ID da conta bancária associada ao lançamento, que estiver selecionada no Livro Caixa atual. Não deve ser modificado via formulário!',
               example: '1234567890abcdef12345678',
            },
            cashBoxId: {
               type: 'string',
               description:
                  'ID do caixa associado ao lançamento, que estiver selecionado no Livro Caixa atual. Não deve ser modificado via formulário!',
               example: '1234567890abcdef12345678',
            },
         },
      },
      400: {
         description: 'Erro de validação ou dados inválidos',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro detalhada sobre o problema encontrado.',
               example: 'Erro de validação. Verifique os campos obrigatórios e os formatos esperados.',
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
         },
      },
      404: {
         description: 'Conta bancária ou caixa não encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Conta bancária ou caixa não encontrado',
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

export const listByAccountIdCashFlowSchema = {
   description: 'Lista os lançamentos do fluxo de caixa por conta bancária',
   tags: ['Cash Flow'],
   summary: 'Listar lançamentos do fluxo de caixa por conta bancária',
   params: {
      type: 'object',
      required: ['bankAccountId'],
      properties: {
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária selecionada para filtrar os lançamentos',
         },
      },
   },
   response: {
      200: {
         description: 'Lista de lançamentos do fluxo de caixa por conta bancária',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string', description: 'ID do lançamento', example: '1234567890abcdef12345678' },
               date: { type: 'string', format: 'date-time', description: 'Data do lançamento', example: '2023-10-01T12:00:00Z' },
               type: { type: 'string', enum: ['CREDIT', 'DEBIT'], description: 'Tipo do lançamento', example: 'CREDIT' },
               value: { type: 'number', format: 'float', description: 'Valor do lançamento', example: 1000.0 },
               historic: { type: 'string', description: 'Histórico do lançamento', example: 'Pagamento de fornecedor' },
               description: {
                  type: 'string',
                  description: 'Descrição adicional do lançamento',
                  example: 'Pagamento referente à compra de materiais',
               },
               costCenter: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do centro de custo associado ao lançamento', example: '1234567890abcdef12345678' },
                     name: { type: 'string', description: 'Nome do centro de custo', example: 'Marketing' },
                  },
               },
               bankAccountId: {
                  type: 'string',
                  description:
                     'ID da conta bancária associada ao lançamento, que estiver selecionada no Livro Caixa atual. Não deve ser modificado via formulário!',
                  example: '1234567890abcdef12345678',
               },
               cashBoxId: {
                  type: 'string',
                  description:
                     'ID do caixa associado ao lançamento, que estiver selecionado no Livro Caixa atual. Não deve ser modificado via formulário!',
                  example: '1234567890abcdef12345678',
               },
               balance: {
                  type: 'number',
                  format: 'float',
                  description: 'Saldo após o lançamento',
                  example: 1000.0,
               },
               createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de criação do lançamento',
                  example: '2023-10-01T12:00:00Z',
               },
               updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de atualização do lançamento',
                  example: '2023-10-01T12:00:00Z',
               },
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
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

export const listByCashCashFlowSchema = {
   description: 'Lista os lançamentos do fluxo de caixa por caixa',
   tags: ['Cash Flow'],
   summary: 'Listar lançamentos do fluxo de caixa por caixa',
   response: {
      200: {
         description: 'Lista de lançamentos do fluxo de caixa por caixa',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: { type: 'string', description: 'ID do lançamento', example: '1234567890abcdef12345678' },
               date: { type: 'string', format: 'date-time', description: 'Data do lançamento', example: '2023-10-01T12:00:00Z' },
               type: { type: 'string', enum: ['CREDIT', 'DEBIT'], description: 'Tipo do lançamento', example: 'CREDIT' },
               value: { type: 'number', format: 'float', description: 'Valor do lançamento', example: 1000.0 },
               historic: { type: 'string', description: 'Histórico do lançamento', example: 'Pagamento de fornecedor' },
               description: {
                  type: 'string',
                  description: 'Descrição adicional do lançamento',
                  example: 'Pagamento referente à compra de materiais',
               },
               costCenter: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', description: 'ID do centro de custo associado ao lançamento', example: '1234567890abcdef12345678' },
                     name: { type: 'string', description: 'Nome do centro de custo', example: 'Marketing' },
                  },
               },
               bankAccountId: {
                  type: 'string',
                  description:
                     'ID da conta bancária associada ao lançamento, que estiver selecionada no Livro Caixa atual. Não deve ser modificado via formulário!',
                  example: '1234567890abcdef12345678',
               },
               cashBoxId: {
                  type: 'string',
                  description:
                     'ID do caixa associado ao lançamento, que estiver selecionado no Livro Caixa atual. Não deve ser modificado via formulário!',
                  example: '1234567890abcdef12345678',
               },
               balance: {
                  type: 'number',
                  format: 'float',
                  description: 'Saldo após o lançamento',
                  example: 1000.0,
               },
               createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de criação do lançamento',
                  example: '2023-10-01T12:00:00Z',
               },
               updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de atualização do lançamento',
                  example: '2023-10-01T12:00:00Z',
               },
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Usuário não autenticado',
            },
         },
      },
      404: {
         description: 'Caixa não encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Caixa não encontrado',
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

export const importBankTransactionsCashFlowSchema = {
   description: 'Importa transações bancárias de um arquivo XLSX',
   tags: ['Cash Flow'],
   summary: 'Importar transações bancárias',
   consumes: ['multipart/form-data'],
   // body: {
   //    type: 'object',
   //    properties: {
   //       bankAccountId: { type: 'string', format: 'uuid' },
   //       file: { type: 'string', format: 'binary' },
   //    },
   //    required: ['bankAccountId', 'file'],
   // },
   response: {
      200: {
         description: 'Importação realizada com sucesso',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: {
                        type: 'string',
                        example: 'Importação realizada com sucesso!',
                     },
                  },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação ou dados inválidos',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: {
                        type: 'string',
                        example: 'Erro de validação. Verifique os campos obrigatórios e os formatos esperados.',
                     },
                  },
               },
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: {
                        type: 'string',
                        example: 'Usuário não autenticado',
                     },
                  },
               },
            },
         },
      },
      404: {
         description: 'Conta bancária não encontrada',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: {
                        type: 'string',
                        example: 'Conta bancária não encontrada',
                     },
                  },
               },
            },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: {
                        type: 'string',
                        example: 'Erro interno do servidor ao importar transações bancárias.',
                     },
                  },
               },
            },
         },
      },
   },
}
