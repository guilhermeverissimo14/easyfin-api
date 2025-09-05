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
                     cashBoxId: { type: 'string', example: '1234567890abcdef12345678' },
                     date: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
                     type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
                     value: { type: 'string', example: 'R$ 1.000,00' },
                     history: { type: 'string', example: 'Pagamento de fornecedor' },
                     description: { type: 'string', example: 'Pagamento referente à compra de materiais' },
                     balance: { type: 'string', example: 'R$ 1.000,00' },
                     documentNumber: { type: 'string', example: '1234567890' },
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
                     cashBoxId: { type: 'string', example: '1234567890abcdef12345678' },
                     date: { type: 'string', format: 'date-time', example: '2023-10-01T12:00:00Z' },
                     type: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
                     value: { type: 'string', example: 'R$ 1.000,00' },
                     history: { type: 'string', example: 'Pagamento de fornecedor' },
                     description: { type: 'string', example: 'Pagamento referente à compra de materiais' },
                     balance: { type: 'string', example: 'R$ 1.000,00' },
                     documentNumber: { type: 'string', example: '1234567890' },
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

export const parseBankTransactionsCashFlowSchema = {
   description: 'Analisa um arquivo XLSX de extrato bancário e retorna as transações estruturadas',
   tags: ['Cash Flow'],
   summary: 'Analisar arquivo de extrato bancário',
   consumes: ['multipart/form-data'],
   response: {
      200: {
         description: 'Análise realizada com sucesso',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     filename: { type: 'string' },
                     sheetNumber: { type: 'number' },
                     totalRows: { type: 'number' },
                     validTransactions: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              date: { type: 'string' },
                              historic: { type: 'string' },
                              value: { type: 'number' },
                              type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
                              detailing: { type: 'string' },
                              originalRow: { type: 'number' }
                           }
                        }
                     },
                     invalidRows: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              row: { type: 'number' },
                              data: { type: 'array', items: { type: 'string' } },
                              reason: { type: 'string' }
                           }
                        }
                     }
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
                     message: { type: 'string' },
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
                     message: { type: 'string' },
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
                     message: { type: 'string' },
                  },
               },
            },
         },
      },
   },
}

export const processBankTransactionsCashFlowSchema = {
   description: 'Processa as transações bancárias validadas e as importa para o sistema',
   tags: ['Cash Flow'],
   summary: 'Processar transações bancárias',
   body: {
      type: 'object',
      properties: {
         bankAccountId: {
            type: 'string',
            description: 'ID da conta bancária',
         },
         filename: {
            type: 'string',
            description: 'Nome do arquivo original',
         },
         transactions: {
            type: 'array',
            description: 'Lista de transações validadas para importar',
            items: {
               type: 'object',
               properties: {
                  date: { type: 'string' },
                  historic: { type: 'string' },
                  value: { type: 'number' },
                  type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
                  costCenterId: { type: 'string' },
                  detailing: { type: 'string' },
                  originalRow: { type: 'number' },
               },
               required: ['date', 'historic', 'value', 'type', 'detailing', 'originalRow'],
            },
         },
      },
      required: ['bankAccountId', 'filename', 'transactions'],
   },
   response: {
      200: {
         description: 'Processamento realizado com sucesso',
         content: {
            'application/json': {
               schema: {
                  type: 'object',
                  properties: {
                     message: { type: 'string', example: 'Importação realizada com sucesso!' },
                     importedTransactions: { type: 'number', example: 145 },
                     finalBalance: { type: 'number', example: 2500000 },
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
                     message: { type: 'string', example: 'Conta bancária não encontrada.' },
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

export const linkReceivableCashFlowSchema = {
   description: 'Vincula um lançamento de crédito com uma conta a receber',
   tags: ['Cash Flow'],
   summary: 'Vincular lançamento à conta a receber',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do lançamento do fluxo de caixa',
         },
      },
      required: ['id'],
   },
   requestBody: {
      required: true,
      content: {
         'application/json': {
            schema: {
               type: 'object',
               properties: {
                  documentNumber: { type: 'string', description: 'Número do documento da conta a receber' },
               },
               required: ['documentNumber'],
            },
         },
      },
   },
   response: {
      200: {
         description: 'Lançamento vinculado com sucesso',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               example: 'Lançamento vinculado com sucesso à conta a receber',
            },
            data: {
               type: 'object',
               properties: {
                  id: { type: 'string', example: '1234567890abcdef12345678' },
                  documentNumber: { type: 'string', example: '123456' },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Número do documento da conta a receber é obrigatório' },
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
         description: 'Lançamento não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Lançamento do fluxo de caixa não encontrado' },
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

export const linkPayableCashFlowSchema = {
   description: 'Vincula um lançamento de débito com uma conta a pagar',
   tags: ['Cash Flow'],
   summary: 'Vincular lançamento à conta a pagar',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do lançamento do fluxo de caixa',
         },
      },
      required: ['id'],
   },
   requestBody: {
      required: true,
      content: {
         'application/json': {
            schema: {
               type: 'object',
               properties: {
                  documentNumber: { type: 'string', description: 'Número do documento da conta a pagar' },
               },
               required: ['documentNumber'],
            },
         },
      },
   },
   response: {
      200: {
         description: 'Lançamento vinculado com sucesso',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               example: 'Lançamento vinculado com sucesso à conta a pagar',
            },
            data: {
               type: 'object',
               properties: {
                  id: { type: 'string', example: '1234567890abcdef12345678' },
                  documentNumber: { type: 'string', example: '123456' },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Número do documento da conta a pagar é obrigatório' },
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
         description: 'Lançamento não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Lançamento do fluxo de caixa não encontrado' },
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

export const unlinkReceivableCashFlowSchema = {
   description: 'Desvincula um lançamento de crédito de uma conta a receber',
   tags: ['Cash Flow'],
   summary: 'Desvincular lançamento da conta a receber',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do lançamento do fluxo de caixa',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Lançamento desvinculado com sucesso',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               example: 'Lançamento desvinculado com sucesso da conta a receber',
            },
            data: {
               type: 'object',
               properties: {
                  id: { type: 'string', example: '1234567890abcdef12345678' },
                  documentNumber: { type: 'null' },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Este lançamento não possui vínculo com conta a receber' },
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
         description: 'Lançamento não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Lançamento do fluxo de caixa não encontrado' },
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

export const unlinkPayableCashFlowSchema = {
   description: 'Desvincula um lançamento de débito de uma conta a pagar',
   tags: ['Cash Flow'],
   summary: 'Desvincular lançamento da conta a pagar',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do lançamento do fluxo de caixa',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Lançamento desvinculado com sucesso',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               example: 'Lançamento desvinculado com sucesso da conta a pagar',
            },
            data: {
               type: 'object',
               properties: {
                  id: { type: 'string', example: '1234567890abcdef12345678' },
                  documentNumber: { type: 'null' },
               },
            },
         },
      },
      400: {
         description: 'Erro de validação',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Este lançamento não possui vínculo com conta a pagar' },
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
         description: 'Lançamento não encontrado',
         type: 'object',
         properties: {
            message: { type: 'string', example: 'Lançamento do fluxo de caixa não encontrado' },
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