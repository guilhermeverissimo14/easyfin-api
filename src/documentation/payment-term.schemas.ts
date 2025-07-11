export const createPaymentTermSchema = {
   description: 'Cria uma nova condição de pagamento',
   tags: ['Payment Term'],
   summary: 'Criar condição de pagamento',
   body: {
      type: 'object',
      properties: {
         paymentMethodId: {
            type: 'string',
            description: 'ID do método de pagamento associado à condição de pagamento',
         },
         condition: {
            type: 'string',
            description: 'Condição de pagamento, ex: 0,30,60',
         },
         description: {
            type: 'string',
            description: 'Descrição da condição de pagamento, ex: Boleto 30 dias',
         },
         installments: {
            type: 'number',
            description: 'Número de parcelas da condição de pagamento',
         },
      },
      required: ['paymentMethodId', 'condition'],
   },
   response: {
      201: {
         description: 'Condição de pagamento criada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da condição de pagamento',
            },
            paymentMethodId: {
               type: 'string',
               description: 'ID do método de pagamento associado à condição de pagamento',
            },
            condition: {
               type: 'string',
               description: 'Condição de pagamento, ex: 0,30,60',
            },
            description: {
               type: 'string',
               description: 'Descrição da condição de pagamento',
            },
            installments: {
               type: 'number',
               description: 'Número de parcelas da condição de pagamento',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação da condição de pagamento',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização da condição de pagamento',
            },
         },
         example: {
            id: 'uuid',
            paymentMethodId: '1234567890abcdef12345678',
            condition: '0,30,60',
            description: 'Boleto 30 dias',
            installments: 3,
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
         },
      },
      400: {
         description: 'Erro ao criar a condição de pagamento',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Condição de pagamento já cadastrada',
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

export const updatePaymentTermSchema = {
   description: 'Atualiza uma condição de pagamento existente',
   tags: ['Payment Term'],
   summary: 'Atualizar condição de pagamento',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da condição de pagamento a ser atualizada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         paymentMethodId: {
            type: 'string',
            description: 'ID do método de pagamento associado à condição de pagamento',
         },
         condition: {
            type: 'string',
            description: 'Condição de pagamento, ex: 0,30,60',
         },
         description: {
            type: 'string',
            description: 'Descrição da condição de pagamento, ex: Boleto 30 dias',
         },
         installments: {
            type: 'number',
            description: 'Número de parcelas da condição de pagamento',
         },
      },
   },
   response: {
      200: {
         description: 'Taxa atualizada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da taxa',
               example: '1234567890abcdef12345678',
            },
            paymentMethodId: {
               type: 'string',
               description: 'ID do método de pagamento associado à condição de pagamento',
            },
            condition: {
               type: 'string',
               description: 'Condição de pagamento, ex: 0,30,60',
            },
            description: {
               type: 'string',
               description: 'Descrição da condição de pagamento',
            },
            installments: {
               type: 'number',
               description: 'Número de parcelas da condição de pagamento',
            },
            createdAt: {
               type: 'string',
               description: 'Data de criação da condição de pagamento',
            },
            updatedAt: {
               type: 'string',
               description: 'Data de atualização da condição de pagamento',
            },
         },
      },
      400: {
         description: 'Erro ao atualizar a condição de pagamento',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Condição de pagamento não encontrada',
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

export const listPaymentTermSchema = {
   description: 'Retorna uma lista de todas as condições de pagamento',
   tags: ['Payment Term'],
   summary: 'Listar todas as condições de pagamento',
   response: {
      200: {
         description: 'Lista de condições de pagamento retornada com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da condição de pagamento',
               },
               paymentMethodId: {
                  type: 'string',
                  description: 'ID do método de pagamento associado à condição de pagamento',
               },
               condition: {
                  type: 'string',
                  description: 'Condição de pagamento, ex: 0,30,60',
               },
               description: {
                  type: 'string',
                  description: 'Descrição da condição de pagamento, ex: Boleto 30 dias',
               },
               installments: {
                  type: 'number',
                  description: 'Número de parcelas da condição de pagamento',
               },
               createdAt: {
                  type: 'string',
                  description: 'Data de criação da condição de pagamento',
               },
               updatedAt: {
                  type: 'string',
                  description: 'Data de atualização da condição de pagamento',
               },
            },
            example: [
               {
                  id: 'uuid',
                  paymentMethodId: '1234567890abcdef12345678',
                  condition: '0,30,60',
                  description: 'Boleto 30 dias',
                  installments: 3,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  paymentMethodId: '1234567890abcdef12345678',
                  condition: '0,15,30',
                  description: 'Boleto 15 dias',
                  installments: 3,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
            ],
         },
      },
      404: {
         description: 'Nenhuma condição de pagamento encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Nenhuma condição de pagamento encontrada',
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

export const getPaymentTermByIdSchema = {
   description: 'Retorna uma condição de pagamento específica pelo ID',
   tags: ['Payment Term'],
   summary: 'Obter condição de pagamento por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da condição de pagamento a ser retornada',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Condição de pagamento encontrada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da taxa',
               example: '1234567890abcdef12345678',
            },
            paymentMethodId: {
               type: 'string',
               description: 'ID do método de pagamento associado à condição de pagamento',
            },
            condition: {
               type: 'string',
               description: 'Condição de pagamento, ex: 0,30,60',
            },
            description: {
               type: 'string',
               description: 'Descrição da condição de pagamento, ex: Boleto 30 dias',
            },
            installments: {
               type: 'number',
               description: 'Número de parcelas da condição de pagamento',
            },
            createdAt: {
               type: 'string',
               description: 'Data de criação da condição de pagamento',
            },
            updatedAt: {
               type: 'string',
               description: 'Data de atualização da condição de pagamento',
            },
         },
         example: {
            id: 'uuid',
            paymentMethodId: '1234567890abcdef12345678',
            condition: '0,30,60',
            description: 'Boleto 30 dias',
            installments: 3,
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
         },
      },
      404: {
         description: 'Condição de pagamento não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Condição de pagamento não encontrada',
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

export const deletePaymentTermSchema = {
   description: 'Deleta uma condição de pagamento específica pelo ID',
   tags: ['Payment Term'],
   summary: 'Deletar condição de pagamento por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da condição de pagamento a ser deletada',
         },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Condição de pagamento deletada com sucesso',
         type: 'null',
      },
      404: {
         description: 'Condição de pagamento não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Condição de pagamento não encontrada',
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
