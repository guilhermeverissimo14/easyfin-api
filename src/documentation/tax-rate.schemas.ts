export const createTaxRateSchema = {
   description: 'Cria uma nova taxa',
   tags: ['TaxRate'],
   summary: 'Criar taxa',
   body: {
      type: 'object',
      properties: {
         year: {
            type: 'number',
            description: 'Ano da taxa',
         },
         month: {
            type: 'number',
            description: 'Mês da taxa',
         },
         issqnTaxRate: {
            type: 'number',
            description: 'Taxa ISSQN',
         },
         effectiveTaxRate: {
            type: 'number',
            description: 'Taxa efetiva',
         },
      },
      required: ['year', 'month', 'issqnTaxRate', 'effectiveTaxRate'],
   },
   response: {
      201: {
         description: 'Taxa criada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da taxa',
            },
            year: {
               type: 'number',
               description: 'Ano da taxa',
            },
            month: {
               type: 'number',
               description: 'Mês da taxa',
            },
            issqnTaxRate: {
               type: 'number',
               description: 'Taxa ISSQN',
            },
            effectiveTaxRate: {
               type: 'number',
               description: 'Taxa efetiva',
            },
         },
         example: {
            id: 'uuid',
            year: 2025,
            month: 6,
            issqnTaxRate: 5.11,
            effectiveTaxRate: 15,
            createdAt: '2025-05-20T18:03:04.474Z',
            updatedAt: '2025-05-20T18:03:04.474Z',
         },
      },
      400: {
         description: 'Erro ao criar a taxa',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Taxa já cadastrada para este ano e mês',
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

export const updateTaxRateSchema = {
   description: 'Atualiza uma taxa existente',
   tags: ['TaxRate'],
   summary: 'Atualizar taxa',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da taxa a ser atualizada',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         year: {
            type: 'number',
            description: 'Novo ano da taxa',
         },
         month: {
            type: 'number',
            description: 'Novo mês da taxa',
         },
         issqnTaxRate: {
            type: 'number',
            description: 'Nova taxa ISSQN',
         },
         effectiveTaxRate: {
            type: 'number',
            description: 'Nova taxa efetiva',
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
            year: {
               type: 'number',
               description: 'Ano da taxa',
               example: 2026,
            },
            month: {
               type: 'number',
               description: 'Mês da taxa',
               example: 7,
            },
            issqnTaxRate: {
               type: 'number',
               description: 'Taxa ISSQN',
               example: 5.22,
            },
            effectiveTaxRate: {
               type: 'number',
               description: 'Taxa efetiva',
               example: 16,
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação',
               example: '2025-05-20T12:00:00.000Z',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização',
               example: '2025-05-21T12:00:00.000Z',
            },
         },
      },
      400: {
         description: 'Erro ao atualizar a taxa',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Taxa não encontrada',
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

export const listTaxRateSchema = {
   description: 'Retorna uma lista de todas as taxas',
   tags: ['TaxRate'],
   summary: 'Listar todas as taxas',
   response: {
      200: {
         description: 'Lista de taxas retornada com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da taxa',
                  example: '6e6a1e0f-2e3a-4145-b666-d0b59b5cf59b',
               },
               year: {
                  type: 'number',
                  description: 'Ano da taxa',
                  example: 2024,
               },
               month: {
                  type: 'number',
                  description: 'Mês da taxa',
                  example: 7,
               },
               issqnTaxRate: {
                  type: 'number',
                  description: 'Taxa ISSQN',
                  example: 4.89,
               },
               effectiveTaxRate: {
                  type: 'number',
                  description: 'Taxa efetiva',
                  example: 14.6,
               },
               createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de criação',
                  example: '2025-05-20T18:03:04.474Z',
               },
               updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de atualização',
                  example: '2025-05-20T18:03:04.474Z',
               },
            },
            example: [
               {
                  id: 'uuid',
                  year: 2025,
                  month: 5,
                  issqnTaxRate: 5.14,
                  effectiveTaxRate: 15.99,
                  createdAt: '2025-05-20T18:03:04.474Z',
                  updatedAt: '2025-05-20T18:03:04.474Z',
               },
               {
                  id: 'uuid',
                  year: 2025,
                  month: 6,
                  issqnTaxRate: 5,
                  effectiveTaxRate: 15,
                  createdAt: '2025-05-20T18:03:04.474Z',
                  updatedAt: '2025-05-20T18:03:04.474Z',
               },
            ],
         },
      },
      404: {
         description: 'Nenhuma taxa encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Nenhuma taxa encontrada',
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

export const getTaxRateByIdSchema = {
   description: 'Retorna uma taxa específica pelo ID',
   tags: ['TaxRate'],
   summary: 'Obter taxa por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da taxa a ser retornada',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Taxa encontrada com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID da taxa',
               example: '1234567890abcdef12345678',
            },
            year: {
               type: 'number',
               description: 'Ano da taxa',
               example: 2026,
            },
            month: {
               type: 'number',
               description: 'Mês da taxa',
               example: 7,
            },
            issqnTaxRate: {
               type: 'number',
               description: 'Taxa ISSQN',
               example: 5.22,
            },
            effectiveTaxRate: {
               type: 'number',
               description: 'Taxa efetiva',
               example: 16,
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação',
               example: '2025-05-20T12:00:00.000Z',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização',
               example: '2025-05-21T12:00:00.000Z',
            },
         },
         example: {
            id: 'uuid',
            year: 2025,
            month: 5,
            issqnTaxRate: 5.14,
            effectiveTaxRate: 15.99,
            createdAt: '2025-05-20T18:03:04.474Z',
            updatedAt: '2025-05-20T18:03:04.474Z',
         },
      },
      404: {
         description: 'Taxa não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Taxa não encontrada',
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

export const deleteTaxRateSchema = {
   description: 'Deleta uma taxa específica pelo ID',
   tags: ['TaxRate'],
   summary: 'Deletar taxa por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID da taxa a ser deletada',
         },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Taxa deletada com sucesso',
         type: 'null',
      },
      404: {
         description: 'Taxa não encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Taxa não encontrada',
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
