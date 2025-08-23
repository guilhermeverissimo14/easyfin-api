import { FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware";
import InvoiceController from "@/controllers/invoice.controller";
import {
	createInvoiceSchema,
	updateInvoiceSchema,
	listInvoicesSchema,
	getInvoiceByIdSchema,
	deleteInvoiceSchema,
} from "@/documentation/invoice.schemas";

const invoicesRoutes: FastifyPluginAsync = async (server) => {
	// Rota para criar uma nova fatura
	server.post(
		"/",
		{ preHandler: authMiddleware, schema: createInvoiceSchema },
		InvoiceController.create,
	);

	// Rota para atualizar uma fatura existente
	server.put(
		"/:id",
		{ preHandler: authMiddleware, schema: updateInvoiceSchema },
		InvoiceController.update,
	);

	// Rota para listar faturas
	server.get(
		"/",
		{ preHandler: authMiddleware, schema: listInvoicesSchema },
		InvoiceController.list,
	);

	// Rota para obter uma fatura por ID
	server.get(
		"/:id",
		{ preHandler: authMiddleware, schema: getInvoiceByIdSchema },
		InvoiceController.getById,
	);

	// Adicionar esta rota
	server.delete(
		"/:id",
		{ preHandler: authMiddleware, schema: deleteInvoiceSchema },
		InvoiceController.delete,
	);
};

export { invoicesRoutes };
