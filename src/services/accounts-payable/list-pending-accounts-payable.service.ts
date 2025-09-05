import { PaymentStatus } from "@prisma/client";
import { prisma } from '@/lib/prisma'

export const listPendingAccountsPayableService = async () => {
	try {
		const accounts = await prisma.accountsPayable.findMany({
			where: {
				status: PaymentStatus.PENDING,
			},
			include: {
				Supplier: true,
				CostCenter: true,
				PaymentMethod: true,
			},
			orderBy: {
				dueDate: "asc",
			},
		});

		accounts.forEach((account) => {
			account.value = account.value != null ? account.value / 100 : 0;
			account.paidValue = account.paidValue
				? account.paidValue / 100
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
			paymentDate: account.paymentDate ? account.paymentDate.toISOString() : null,
			value: account.value,
			paidValue: account.paidValue || 0,
			discount: account.discount || 0,
			fine: account.fine || 0,
			interest: account.interest || 0,
			installmentNumber: account.installmentNumber || 1,
			totalInstallments: account.totalInstallments || 1,
			observation: account.observation || null,
			status: account.status,
			userId: account.userId || null,
			supplier: {
				id: account.supplierId,
				name: account.Supplier.name,
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
		console.error("Erro ao listar contas a pagar pendentes:", error);
		throw new Error("Erro ao listar contas a pagar pendentes");
	}
};