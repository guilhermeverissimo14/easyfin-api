export const healthCheckSchema = {
   description: 'Verifica o status do servidor e do banco de dados',
   tags: ['Health'],
   response: {
      200: {
         description: 'Status do servidor',
         type: 'object',
         properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            database: { type: 'string' },
         },
         example: {
            status: 'OK',
            message: 'Server is running successfully',
            database: 'Connected',
         },
      },
   },
}
