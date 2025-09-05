import { AppError } from "@/helpers/app-error";
import { prisma } from "@/lib/prisma";

export const unlinkPayableFromCashFlowService = async (data: {
	cashFlowId: string;
}) => {
	const { cashFlowId } = data;

	try {
		return await prisma.$transaction(async (prisma) => {
			const cashFlow = await prisma.cashFlow.findUnique({
				where: { id: cashFlowId },
			});

			if (!cashFlow) {
				throw new AppError("Lançamento do fluxo de caixa não encontrado", 404);
			}

			if (!cashFlow.documentNumber) {
				throw new AppError("Este lançamento não possui vínculo com conta a pagar", 400);
			}

			const updatedCashFlow = await prisma.cashFlow.update({
				where: { id: cashFlowId },
				data: {
					documentNumber: null,
				},
			});

			return updatedCashFlow;
		});
	} catch (error) {
		if (error instanceof AppError) {
				throw error;
		}
		console.error("Erro ao desvincular conta a pagar do fluxo de caixa:", error);
		throw new AppError("Erro interno do servidor", 500);
	}
};