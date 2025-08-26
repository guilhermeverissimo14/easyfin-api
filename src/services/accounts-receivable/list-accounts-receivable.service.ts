import { setToEndOfDayUTC, setToStartOfDayUTC } from "@/utils/format";
import { PaymentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listAccountsReceivableService = async (filters: {
	customerId?: string;
	costCenterId?: string;
	status?: PaymentStatus;
	paymentMethodId?: string;
	dueDateStart?: Date;
	dueDateEnd?: Date;
	documentDateStart?: Date;
	documentDateEnd?: Date;
}) => {
	let {
		customerId,
		costCenterId,
		status,
		paymentMethodId,
		dueDateStart,
		dueDateEnd,
		documentDateStart,
		documentDateEnd,
	} = filters;

	if (dueDateStart) {
		dueDateStart = setToStartOfDayUTC(dueDateStart);
	}
	if (dueDateEnd) {
		dueDateEnd = setToEndOfDayUTC(dueDateEnd);
	}

	if (documentDateStart) {
		documentDateStart = setToStartOfDayUTC(documentDateStart);
	}
	if (documentDateEnd) {
		documentDateEnd = setToEndOfDayUTC(documentDateEnd);
	}

	const whereClause: any = {
		customerId,
		costCenterId,
		paymentMethodId,
		status,
	};

	if (dueDateStart || dueDateEnd) {
		whereClause.dueDate = {
			...(dueDateStart ? { gte: dueDateStart } : {}),
			...(dueDateEnd ? { lte: dueDateEnd } : {}),
		};
	}

	if (documentDateStart || documentDateEnd) {
		whereClause.documentDate = {
			...(documentDateStart ? { gte: documentDateStart } : {}),
			...(documentDateEnd ? { lte: documentDateEnd } : {}),
		};
	}

	let accounts;

	try {
		accounts = await prisma.accountsReceivable.findMany({
			where: whereClause,
			include: {
				Customer: true,
				CostCenter: true,
				PaymentMethod: true,
			},
			orderBy: {
				dueDate: "asc",
			},
		});
	} catch (error) {
		console.error("Erro ao listar contas a receber:", error);
		throw new Error("Erro ao listar contas a receber");
	}

	// Buscar todas as invoices para verificar vínculos
	const invoiceNumbers = await prisma.invoice.findMany({
		select: {
			invoiceNumber: true,
		},
	});

	const invoiceNumbersSet = new Set(
		invoiceNumbers.map((invoice) => invoice.invoiceNumber),
	);

	accounts.forEach((account) => {
		account.value = account.value != null ? account.value / 100 : 0;
		account.receivedValue = account.receivedValue
			? account.receivedValue / 100
			: 0;
		account.discount = account.discount ? account.discount / 100 : 0;
		account.fine = account.fine ? account.fine / 100 : 0;
		account.interest = account.interest ? account.interest / 100 : 0;
	});

	return accounts.map((account) => ({
		id: account.id,
		documentNumber: account.documentNumber,
		documentDate: account.documentDate
			? account.documentDate.toISOString()
			: null,
		launchDate: account.launchDate ? account.launchDate.toISOString() : null,
		dueDate: account.dueDate ? account.dueDate.toISOString() : null,
		receiptDate: account.receiptDate ? account.receiptDate.toISOString() : null,
		value: account.value,
		receivedValue: account.receivedValue || 0,
		discount: account.discount || 0,
		fine: account.fine || 0,
		interest: account.interest || 0,
		installmentNumber: account.installmentNumber || 1,
		totalInstallments: account.totalInstallments || 1,
		observation: account.observation || null,
		status: account.status || PaymentStatus.PENDING,
		userId: account.userId || null,
		hasInvoiceLink: account.documentNumber
			? invoiceNumbersSet.has(account.documentNumber)
			: false,
		customer: {
			id: account.customerId,
			name: account.Customer.name,
		},
		costCenter: {
			id: account.costCenterId || null,
			name: account.CostCenter?.name || null,
		},
		paymentMethod: {
			id: account.paymentMethodId || null,
			name: account.PaymentMethod?.name || null,
		},
	}));
};
