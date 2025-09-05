import { PaymentStatus } from "@prisma/client";
import { prisma } from '@/lib/prisma'

export const listPendingAccountsReceivableService = async () => {
	try {
		const accounts = await prisma.accountsReceivable.findMany({
			where: {
				status: PaymentStatus.PENDING,
			},
			include: {
				Customer: true,
				CostCenter: true,
				PaymentMethod: true,
			},
			orderBy: {
				dueDate: "asc",
			},
		});

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
			status: account.status,
			userId: account.userId || null,
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
	} catch (error) {
		console.error("Erro ao listar contas a receber pendentes:", error);
		throw new Error("Erro ao listar contas a receber pendentes");
	}
};