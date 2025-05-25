export const listPaymentMethodSchema = {
   description: 'Retorna uma lista de todos os métodos de pagamento',
   tags: ['Payment Method'],
   summary: 'Listar todos os métodos de pagamento',
   response: {
      200: {
         description: 'Lista de métodos de pagamento retornada com sucesso',
         type: 'array',
         items: {
            type: 'object',
            properties: {
               id: {
                  type: 'string',
                  description: 'ID da condição de pagamento',
               },
               name: {
                  type: 'string',
                  description: 'Nome do método de pagamento',
               },
               requiresBank: {
                  type: 'boolean',
                  description: 'Indica se o método de pagamento requer banco (true por default)',
               },
               createdAt: {
                  type: 'string',
                  description: 'Data de criação do método de pagamento',
               },
               updatedAt: {
                  type: 'string',
                  description: 'Data de atualização do método de pagamento',
               },
            },
            example: [
               {
                  id: 'uuid',
                  name: 'Boleto',
                  requiresBank: true,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Dinheiro',
                  requiresBank: false,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Cartão de Crédito',
                  requiresBank: true,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Cartão de Débito',
                  requiresBank: true,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Pix',
                  requiresBank: true,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
               {
                  id: 'uuid',
                  name: 'Transferência Bancária',
                  requiresBank: true,
                  createdAt: '2025-05-01T00:00:00Z',
                  updatedAt: '2025-05-01T00:00:00Z',
               },
            ],
         },
      },
      404: {
         description: 'Nenhuma forma de pagamento encontrada',
         type: 'object',
         properties: {
            message: {
               type: 'string',
               description: 'Mensagem de erro',
               example: 'Nenhuma forma de pagamento encontrada',
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
