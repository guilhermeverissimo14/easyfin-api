import "./config/module-alias";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fs from "fs";
import path from "path";
import cors from "@fastify/cors";
import { startOverdueUpdaterJob } from "./jobs/overdue-updater.job";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyMultipart from "@fastify/multipart";
import { authRoutes } from "./routes/auth.routes";
import { healthRoutes } from "./routes/health.routes";
import { userRoutes } from "./routes/user.routes";
import { customerRoutes } from "./routes/customer.routes";
import { supplierRoutes } from "./routes/supplier.routes";
import { taxRatesRoutes } from "./routes/tax-rates.routes";
import { paymentTermsRoutes } from "./routes/payment-term.routes";
import { costCenterRoutes } from "./routes/cost-center.routes";
import { bankAccountRoutes } from "./routes/bank-account.routes";
import { paymentMethodsRoutes } from "./routes/payment-method.routes";
import { accountPayableRoutes } from "./routes/account-payable.routes";
import { cashFlowRoutes } from "./routes/cash-flow.routes";
import { settingsRoutes } from "./routes/settings.routes";
import { accountReceivableRoutes } from "./routes/account-receivable.routes";
import { invoicesRoutes } from "./routes/invoices.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";

const server = Fastify();

startOverdueUpdaterJob();

server.register(cors, {
	origin: "*",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
});

server.register(fastifyMultipart, {
	attachFieldsToBody: false,
	limits: {
		fieldNameSize: 100,
		fieldSize: 1000000,
		fields: 10,
		fileSize: 10000000, // 10MB
		files: 1,
		headerPairs: 2000,
	},
});

server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/public/",
});

server.register(fastifySwagger, {
	openapi: {
		info: {
			title: "API Easyfin",
			description: "Documentação da API para o sistema Easyfin",
			version: "1.0.0",
		},
		servers: [
			{
				url: process.env.BASE_URL || "http://localhost:3333",
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [{ BearerAuth: [] }],
		tags: [
			{ name: "Health", description: "Verifica se a API está funcionando" },
			{ name: "Auth", description: "Autenticação" },
			{ name: "Settings", description: "Configurações do sistema" },
			{ name: "User", description: "Usuários" },
			{ name: "Customer", description: "Clientes" },
			{ name: "Supplier", description: "Fornecedores" },
			{ name: "Tax Rate", description: "Alíquotas" },
			{ name: "Payment Term", description: "Condições de pagamento" },
			{ name: "Cost Center", description: "Centros de custo" },
			{ name: "Bank Account", description: "Contas bancárias" },
			{ name: "Payment Method", description: "Métodos de pagamento" },
			{ name: "Accounts Payable", description: "Contas a pagar" },
			{ name: "Accounts Receivable", description: "Contas a receber" },
			{ name: "Cash Flow", description: "Fluxo de caixa" },
			{ name: "Invoice", description: "Faturas" },
			{ name: "Dashboard", description: "Dashboard e relatórios" },
		],
	},
});

server.register(fastifySwaggerUi, {
	routePrefix: "/documentation",
	uiConfig: {
		docExpansion: "none",
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (request, reply, next) {
			next();
		},
		preHandler: function (request, reply, next) {
			next();
		},
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	transformSpecification: (swaggerObject, request, reply) => {
		return swaggerObject;
	},
	transformSpecificationClone: true,
});

server.get("/", async (request, reply) => {
	return { message: "API Easyfin está funcionando! 🚀" };
});

server.register(healthRoutes, { prefix: "/" });
server.register(authRoutes, { prefix: "/api/auth" });
server.register(userRoutes, { prefix: "/api/users" });
server.register(customerRoutes, { prefix: "/api/customers" });
server.register(supplierRoutes, { prefix: "/api/suppliers" });
server.register(taxRatesRoutes, { prefix: "/api/tax-rates" });
server.register(paymentTermsRoutes, { prefix: "/api/payment-terms" });
server.register(costCenterRoutes, { prefix: "/api/cost-centers" });
server.register(bankAccountRoutes, { prefix: "/api/bank-accounts" });
server.register(paymentMethodsRoutes, { prefix: "/api/payment-methods" });
server.register(accountPayableRoutes, { prefix: "/api/accounts-payable" });
server.register(accountReceivableRoutes, {
	prefix: "/api/accounts-receivable",
});
server.register(cashFlowRoutes, { prefix: "/api/cash-flow" });
server.register(settingsRoutes, { prefix: "/api/settings" });
server.register(invoicesRoutes, { prefix: "/api/invoices" });
server.register(dashboardRoutes, { prefix: "/api/dashboard" });

server.get("/logo.png", async (request, reply) => {
	const logoPath = path.join(__dirname, "../public/logo.png");

	if (!fs.existsSync(logoPath)) {
		return reply.status(404).send({ error: "Arquivo não encontrado" });
	}

	return reply.sendFile("logo.png", path.join(__dirname, "../public"));
});

export const startServer = async () => {
	try {
		const PORT = process.env.PORT || 8080;
		await server.listen({ port: Number(PORT), host: "0.0.0.0" });

		console.log(
			`Server running at https://easyapp-api.mgioqc.easypanel.host:${PORT} 🚀`,
		);
		server.swagger();
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

startServer();
