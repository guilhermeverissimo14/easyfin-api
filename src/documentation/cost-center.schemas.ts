export const createCostCenterSchema = {
   description: 'Cria um novo centro de custo',
   tags: ['Cost Center'],
   summary: 'Criar centro de custo',
   body: {
      type: 'object',
      properties: {
         name: {
            type: 'string',
            description: 'Nome do centro de custo',
         },
      },
      required: ['name'],
   },
   response: {
      201: {
         description: 'Centro de custo criado com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID do centro de custo',
            },
            name: {
               type: 'string',
               description: 'Nome do centro de custo',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação do centro de custo',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização do centro de custo',
            },
         },
         example: {
            id: 'uuid',
            name: 'Compras de Materiais',
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
         },
      },
      400: {
         description: 'Erro ao criar o centro de custo',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Centro de custo já cadastrado',
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

export const updateCostCenterSchema = {
   description: 'Atualiza um centro de custo existente',
   tags: ['Cost Center'],
   summary: 'Atualizar centro de custo',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do centro de custo a ser atualizado',
         },
      },
      required: ['id'],
   },
   body: {
      type: 'object',
      properties: {
         name: {
            type: 'string',
            description: 'Nome do centro de custo',
         },
      },
   },
   response: {
      200: {
         description: 'Centro de custo atualizado com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID do centro de custo',
               example: '1234567890abcdef12345678',
            },
            name: {
               type: 'string',
               description: 'Nome do centro de custo',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação do centro de custo',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização do centro de custo',
            },
         },
      },
      400: {
         description: 'Erro ao atualizar o centro de custo',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Centro de custo não encontrado',
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

export const listCostCenterSchema = {
   description: 'Retorna uma lista de todos os centros de custo',
   tags: ['Cost Center'],
   summary: 'Listar todos os centros de custo',
   response: {
      200: {
         description: 'Lista de centros de custo retornada com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID do centro de custo',
               },
               name: {
                  type: 'string',
                  description: 'Nome do centro de custo',
               },
            },
            example: [
               {
                  id: 'uuid',
                  name: 'Compras de Materiais',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Despesas Administrativas',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Despesas Gerais',
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
            ],
         },
      },
      404: {
         description: 'Nenhum centro de custo encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Nenhum centro de custo encontrado',
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

export const getCostCenterByIdSchema = {
   description: 'Retorna um centro de custo específico pelo ID',
   tags: ['Cost Center'],
   summary: 'Obter centro de custo por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do centro de custo a ser retornado',
         },
      },
      required: ['id'],
   },
   response: {
      200: {
         description: 'Centro de custo encontrado com sucesso',
         type: 'object',
         properties: {
            id: {
               type: 'string',
               description: 'ID do centro de custo',
               example: '1234567890abcdef12345678',
            },
            name: {
               type: 'string',
               description: 'Nome do centro de custo',
               example: 'Compras de Materiais',
            },
            createdAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de criação do centro de custo',
               example: '2025-05-01T00:00:00Z',
            },
            updatedAt: {
               type: 'string',
               format: 'date-time',
               description: 'Data de atualização do centro de custo',
               example: '2025-05-01T00:00:00Z',
            },
         },
         example: {
            id: 'uuid',
            name: 'Compras de Materiais',
            createdAt: '2025-05-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
         },
      },
      404: {
         description: 'Centro de custo não encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Centro de custo não encontrado',
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

export const deleteCostCenterSchema = {
   description: 'Deleta um centro de custo específico pelo ID',
   tags: ['Cost Center'],
   summary: 'Deletar centro de custo por ID',
   params: {
      type: 'object',
      properties: {
         id: {
            type: 'string',
            description: 'ID do centro de custo a ser deletado',
         },
      },
      required: ['id'],
   },
   response: {
      204: {
         description: 'Centro de custo deletado com sucesso',
         type: 'null',
      },
      404: {
         description: 'Centro de custo não encontrado',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Centro de custo não encontrado',
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
