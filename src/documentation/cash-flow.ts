export const getTotalsPerDayCashFlowSchema = {
   description: 'Obtém os totais de entradas, saídas e saldo do fluxo de caixa por dia',
   tags: ['Cash Flow'],
   summary: 'Obter totais do fluxo de caixa por dia',
   querystring: {
      type: 'object',
      properties: {
         date: {
            type: 'string',
            format: 'date',
            description: 'Data para consulta dos totais (formato YYYY-MM-DD)',
         },
      },
      required: ['date'],
   },
   response: {
      200: {
         description: 'Totais do fluxo de caixa para o dia especificado',
         type: 'object',
         properties: {
            date: {
               type: 'string',
               format: 'date',
               description: 'Data consultada',
               example: '2023-10-01',
            },
            totalEntries: {
               type: 'number',
               format: 'float',
               description: 'Total de entradas do dia',
               example: 1500.0,
            },
            totalExits: {
               type: 'number',
               format: 'float',
               description: 'Total de saídas do dia',
               example: 500.0,
            },
            balance: {
               type: 'number',
               format: 'float',
               description: 'Saldo do dia (entradas - saídas)',
               example: 1000.0,
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
            description: 'ID da conta bancária associada ao lançamento',
         },
         cashBoxId: {
            type: 'string',
            description: 'ID do caixa associado ao lançamento',
         },
      },
   },
   response: {
      201: {
         description: 'Lançamento criado com sucesso',
         type: 'object',
         properties: {
            id: { type: 'string', example: '1234567890abcdef12345678' },
            date: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
            type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
            value: { type: 'number', format: 'float', example: 1000.0 },
            historic: { type: 'string', example: 'Pagamento de fornecedor' },
            description: { type: 'string', example: 'Pagamento referente à compra de materiais' },
            costCenterId: { type: 'string', example: '1234567890abcdef12345678' },
            bankAccountId: { type: 'string', example: '1234567890abcdef12345678' },
            cashBoxId: { type: 'string', example: '1234567890abcdef12345678' },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Erro de validação' },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Usuário não autenticado' },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Erro interno do servidor' },
         },
      },
   },
}

export const listByAccountCashFlowSchema = {
   description: 'Lista os lançamentos do fluxo de caixa por conta bancária com paginação e filtros',
   tags: ['Cash Flow'],
   summary: 'Listar lançamentos do fluxo de caixa por conta bancária',
   params: {
      type: 'object',
      properties: {
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária',
         },
      },
      required: ['bankAccountId'],
   },
   querystring: {
      type: 'object',
      properties: {
         page: { type: 'string', description: 'Número da página', default: '1' },
         limit: { type: 'string', description: 'Limite de itens por página', default: '10' },
         type: { type: 'string', enum: ['CREDIT', 'DEBIT'], description: 'Tipo do lançamento' },
         description: { type: 'string', description: 'Filtro por descrição (busca parcial)' },
         history: { type: 'string', description: 'Filtro por histórico (busca parcial)' },
         costCenterId: { type: 'string', description: 'ID do centro de custo' },
         dateStart: { type: 'string', format: 'date', description: 'Data inicial para filtro' },
         dateEnd: { type: 'string', format: 'date', description: 'Data final para filtro' },
         valueMin: { type: 'string', description: 'Valor mínimo para filtro' },
         valueMax: { type: 'string', description: 'Valor máximo para filtro' },
      },
   },
   response: {
      200: {
         description: 'Lista paginada de lançamentos do fluxo de caixa por conta bancária',
         type: 'object',
         properties: {
            data: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', example: '1234567890abcdef12345678' },
                     date: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
                     type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
                     value: { type: 'string', example: 'R$ 1.000,00' },
                     history: { type: 'string', example: 'Pagamento de fornecedor' },
                     description: { type: 'string', example: 'Pagamento referente à compra de materiais' },
                     balance: { type: 'string', example: 'R$ 1.000,00' },
                     costCenter: {
                        type: 'object',
                        properties: {
                           id: { type: 'string', example: '1234567890abcdef12345678' },
                           name: { type: 'string', example: 'Marketing' },
                        },
                     },
                  },
               },
            },
            pagination: {
               type: 'object',
               properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  totalCount: { type: 'number', example: 100 },
                  totalPages: { type: 'number', example: 10 },
                  hasNextPage: { type: 'boolean', example: true },
                  hasPreviousPage: { type: 'boolean', example: false },
               },
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Usuário não autenticado' },
         },
      },
      404: {
         description: 'Conta bancária não encontrada',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Conta bancária não encontrada' },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Erro interno do servidor' },
         },
      },
   },
}

export const listByCashCashFlowSchema = {
   description: 'Lista os lançamentos do fluxo de caixa por caixa com paginação e filtros',
   tags: ['Cash Flow'],
   summary: 'Listar lançamentos do fluxo de caixa por caixa',
   querystring: {
      type: 'object',
      properties: {
         page: { type: 'string', description: 'Número da página', default: '1' },
         limit: { type: 'string', description: 'Limite de itens por página', default: '10' },
         type: { type: 'string', enum: ['CREDIT', 'DEBIT'], description: 'Tipo do lançamento' },
         description: { type: 'string', description: 'Filtro por descrição (busca parcial)' },
         history: { type: 'string', description: 'Filtro por histórico (busca parcial)' },
         costCenterId: { type: 'string', description: 'ID do centro de custo' },
         dateStart: { type: 'string', format: 'date', description: 'Data inicial para filtro' },
         dateEnd: { type: 'string', format: 'date', description: 'Data final para filtro' },
         valueMin: { type: 'string', description: 'Valor mínimo para filtro' },
         valueMax: { type: 'string', description: 'Valor máximo para filtro' },
      },
   },
   response: {
      200: {
         description: 'Lista paginada de lançamentos do fluxo de caixa por caixa',
         type: 'object',
         properties: {
            data: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     id: { type: 'string', example: '1234567890abcdef12345678' },
                     date: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
                     type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
                     value: { type: 'string', example: 'R$ 1.000,00' },
                     history: { type: 'string', example: 'Pagamento de fornecedor' },
                     description: { type: 'string', example: 'Pagamento referente à compra de materiais' },
                     balance: { type: 'string', example: 'R$ 1.000,00' },
                     costCenter: {
                        type: 'object',
                        properties: {
                           id: { type: 'string', example: '1234567890abcdef12345678' },
                           name: { type: 'string', example: 'Marketing' },
                        },
                     },
                  },
               },
            },
            pagination: {
               type: 'object',
               properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  totalCount: { type: 'number', example: 100 },
                  totalPages: { type: 'number', example: 10 },
                  hasNextPage: { type: 'boolean', example: true },
                  hasPreviousPage: { type: 'boolean', example: false },
               },
            },
         },
      },
      401: {
         description: 'Usuário não autenticado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Usuário não autenticado' },
         },
      },
      404: {
         description: 'Caixa não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Caixa não encontrado' },
         },
      },
      500: {
         description: 'Erro interno do servidor',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Erro interno do servidor' },
         },
      },
   },
}

export const importBankTransactionsCashFlowSchema = {
   description: 'Importa transações bancárias de um arquivo XLSX',
   tags: ['Cash Flow'],
   summary: 'Importar transações bancárias',
   consumes: ['multipart/form-data'],
   response: {
      200: {
         description: 'Importação realizada com sucesso',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: { type: 'string', example: 'Importação realizada com sucesso!' },
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
                     message: { type: 'string', example: 'Arquivo XLSX vazio ou com formato inválido.' },
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
                     message: { type: 'string', example: 'Usuário não autenticado' },
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
                     message: { type: 'string', example: 'Erro interno do servidor' },
                  },
               },
            },
         },
      },
   },
}
