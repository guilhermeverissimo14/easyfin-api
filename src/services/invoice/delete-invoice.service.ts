import { PaymentStatus } from "@prisma/client";
import { AppError } from "@/helpers/app-error";
import { prisma } from '@/lib/prisma'

export const deleteInvoiceService = async (id: string) => {
	try {
		return await prisma.$transaction(async (prisma) => {
			const existingInvoice = await prisma.invoice.findUnique({
				where: { id },
			});

			if (!existingInvoice) {
				throw new AppError("Fatura não encontrada", 404);
			}

			// Verificar se existem contas a receber relacionadas
			const accountsReceivable = await prisma.accountsReceivable.findMany({
				where: {
					documentNumber: existingInvoice.invoiceNumber,
					customerId: existingInvoice.customerId,
				},
			});

			// Verificar se alguma conta foi liquidada (integral ou parcialmente)
			const hasPayments = accountsReceivable.some(
				(account) =>
					account.status === PaymentStatus.PAID ||
					(account.receivedValue && account.receivedValue > 0),
			);

			if (hasPayments) {
				throw new AppError(
					"Não é possível excluir esta fatura pois possui pagamentos realizados (integral ou parcialmente)",
					400,
				);
			}

			if (accountsReceivable.length > 0) {
				await prisma.accountsReceivable.deleteMany({
					where: {
						documentNumber: existingInvoice.invoiceNumber,
						customerId: existingInvoice.customerId,
					},
				});
			}

			await prisma.invoice.delete({
				where: { id },
			});

			return { message: "Fatura excluída com sucesso" };
		});
	} catch (error: any) {
		if (error instanceof AppError) {
			throw error;
		}
		console.error(error);
		throw new AppError("Erro ao excluir fatura", 500);
	}
};
