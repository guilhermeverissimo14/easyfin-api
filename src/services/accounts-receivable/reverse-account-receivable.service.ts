import { PaymentStatus, TransactionType } from "@prisma/client";
import { AppError } from "@/helpers/app-error";
import {
	recalculateCashFlowBalances,
	recalculateCashBoxFlowBalances,
} from "@/utils/recalculate-cash-flow-balances";
import { prisma } from '@/lib/prisma'

export const reverseAccountReceivableService = async (
	id: string,
	reason?: string,
) => {
	const account = await prisma.accountsReceivable.findUnique({
		where: { id },
	});

	if (!account) {
		throw new AppError("Conta a receber não encontrada", 404);
	}

	if (account.status !== PaymentStatus.PAID) {
		throw new AppError(
			"Esta conta não está liquidada e não pode ser estornada",
			400,
		);
	}

	if (!account.receiptDate) {
		throw new AppError(
			"Conta sem data de recebimento não pode ser estornada",
			400,
		);
	}

	if (!account.receivedValue) {
		throw new AppError("Conta sem valor recebido não pode ser estornada", 400);
	}

	const receivedAmount = account.receivedValue;

	try {
		const reversedAccount = await prisma.$transaction(async (prisma) => {
			// 1. Reverter o status da conta e limpar campos de liquidação
			const reversedAccount = await prisma.accountsReceivable.update({
				where: { id },
				data: {
					status: PaymentStatus.PENDING,
					receiptDate: null,
					receivedValue: 0,
					fine: 0,
					interest: 0,
					discount: 0,
					observation: reason ? `ESTORNADO: ${reason}` : "ESTORNADO",
				},
			});

			// 2. Se foi liquidado em conta bancária, estornar transações bancárias
			if (account.bankAccountId) {
				// Buscar a transação bancária relacionada ao recebimento
				console.log('Buscando transação bancária relacionada ao recebimento')
				console.log('account.bankAccountId', account.bankAccountId)
				console.log('receivedAmount', receivedAmount)
				
				const bankTransaction = await prisma.bankTransactions.findFirst({
					where: {
						bankAccountId: account.bankAccountId,
						type: TransactionType.CREDIT,
						amount: receivedAmount,
						description: { contains: "Recebimento de conta a receber" },
						transactionAt: {
							gte: new Date(
								account.receiptDate!.getTime() - 24 * 60 * 60 * 1000,
							), // 1 dia antes
							lte: new Date(
								account.receiptDate!.getTime() + 24 * 60 * 60 * 1000,
							), // 1 dia depois
						},
					},
					orderBy: { createdAt: "desc" },
				});

				console.log("Transação bancária: ", bankTransaction);

				if (bankTransaction) {
					// Criar transação de estorno (débito)
					await prisma.bankTransactions.create({
						data: {
							bankAccountId: account.bankAccountId,
							type: TransactionType.DEBIT,
							description: "Estorno de recebimento de conta a receber",
							detailing: reason || "Estorno de liquidação",
							amount: receivedAmount,
							transactionAt: new Date(),
						},
					});

					// Atualizar saldo bancário
					const bankBalance = await prisma.bankBalance.findFirst({
						where: { bankAccountId: account.bankAccountId },
					});

					if (bankBalance) {
						await prisma.bankBalance.update({
							where: { id: bankBalance.id },
							data: {
								balance: bankBalance.balance - receivedAmount,
							},
						});
					}
				}

				// Remover entrada do fluxo de caixa bancário
				const cashFlowEntry = await prisma.cashFlow.findFirst({
               where: {
                  documentNumber: account.documentNumber,
                  bankAccountId: account.bankAccountId,
                  type: TransactionType.CREDIT,
                  value: receivedAmount,
               },
               orderBy: { createdAt: 'desc' },
            })

				if (cashFlowEntry) {
					await prisma.cashFlow.delete({
						where: { id: cashFlowEntry.id },
					});
				}
			} else {
				// 3. Se foi liquidado em caixa, estornar transações de caixa
				const cash = await prisma.cashBox.findFirst();

				if (cash) {
					// Buscar a transação de caixa relacionada ao recebimento
					const cashTransaction = await prisma.cashTransaction.findFirst({
						where: {
							cashBoxId: cash.id,
							type: TransactionType.CREDIT,
							amount: receivedAmount,
							description: { contains: "Recebimento de conta a receber" },
							transactionAt: {
								gte: new Date(
									account.receiptDate!.getTime() - 72 * 60 * 60 * 1000,
								),
								lte: new Date(
									account.receiptDate!.getTime() + 72 * 60 * 60 * 1000,
								),
							},
						},
						orderBy: { createdAt: "desc" },
					});

					// Atualizar saldo do caixa
					await prisma.cashBox.update({
						where: { id: cash.id },
						data: {
							balance: {
								decrement: receivedAmount,
							},
						},
					});

					if (cashTransaction) {
						// Criar transação de estorno (débito)
						await prisma.cashTransaction.create({
							data: {
								cashBoxId: cash.id,
								type: TransactionType.DEBIT,
								description: "Estorno de recebimento de conta a receber",
								amount: receivedAmount,
								transactionAt: new Date(),
							},
						});
					}

					// Remover entrada do fluxo de caixa
					const cashFlowEntry = await prisma.cashFlow.findFirst({
                  where: {
                     documentNumber: account.documentNumber,
                     cashBoxId: cash.id,
                     type: TransactionType.CREDIT,
                     value: receivedAmount,
                  },
                  orderBy: { createdAt: 'desc' },
               })

					if (cashFlowEntry) {
						await prisma.cashFlow.delete({
							where: { id: cashFlowEntry.id },
						});
					}
				}
			}

			return {
				...reversedAccount,
				value: reversedAccount.value ? reversedAccount.value / 100 : 0,
			};
		}, {
			timeout: 30000,
		});

		// Recalcular saldos APÓS a transação
		if (account.bankAccountId) {
			await recalculateCashFlowBalances(account.bankAccountId);
		} else {
			const cash = await prisma.cashBox.findFirst();
			if (cash) {
				await recalculateCashBoxFlowBalances(cash.id);
			}
		}

		return reversedAccount;
	} catch (error) {
		console.error("Erro ao estornar conta a receber:", error);
		throw new AppError("Erro ao estornar conta a receber", 500);
	}
};
