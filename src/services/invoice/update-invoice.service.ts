import { PrismaClient, PaymentStatus, Customer } from "@prisma/client";
import { AppError } from "@/helpers/app-error";

const prisma = new PrismaClient();

interface UpdateInvoiceData {
	id: string;
	invoiceNumber?: string;
	customerId?: string;
	paymentConditionId?: string;
	issueDate?: string;
	serviceValue?: number;
	retainsIss?: boolean;
	bankAccountId?: string;
	costCenterId?: string;
	notes?: string;
	userId?: string;
}

export const updateInvoiceService = async (data: UpdateInvoiceData) => {
	const {
		id,
		invoiceNumber,
		customerId,
		paymentConditionId,
		issueDate,
		serviceValue,
		retainsIss,
		bankAccountId,
		costCenterId,
		notes,
		userId,
	} = data;

	try {
		return await prisma.$transaction(async (prisma) => {
			const existingInvoice = await prisma.invoice.findUnique({
				where: { id },
			});

			if (!existingInvoice) {
				throw new AppError("Fatura não encontrada", 404);
			}

			let customer: Customer | null = null;

			if (customerId) {
				customer = await prisma.customer.findUnique({
					where: { id: customerId },
				});
				if (!customer) {
					throw new AppError("Cliente não encontrado", 404);
				}
			}

			let paymentTerms = null;
			let conditions: number[] = [];
			let paymentConditionChanged = false;

			if (
				paymentConditionId &&
				paymentConditionId !== existingInvoice.paymentConditionId
			) {
				paymentTerms = await prisma.paymentTerms.findUnique({
					where: { id: paymentConditionId },
				});
				if (!paymentTerms) {
					throw new AppError("Condição de pagamento não encontrada", 404);
				}
				conditions = paymentTerms.condition.split(",").map(Number);
				paymentConditionChanged = true;
			}

			let issueDateObj = existingInvoice.issueDate;
			let year = existingInvoice.year;
			let month = existingInvoice.month;
			let taxRates;
			let newDueDate = existingInvoice.dueDate;

			if (issueDate) {
				issueDateObj = new Date(issueDate);
				year = issueDateObj.getFullYear();
				month = issueDateObj.getMonth() + 1;

				taxRates = await prisma.taxRates.findFirst({
					where: {
						year,
						month,
					},
				});
			}

			if (paymentConditionChanged || issueDate) {
				if (paymentConditionChanged) {
					const maxConditionDays = Math.max(...conditions);
					newDueDate = new Date(issueDateObj);
					newDueDate.setDate(issueDateObj.getDate() + maxConditionDays);
				} else if (issueDate) {
					const existingPaymentTerms = await prisma.paymentTerms.findUnique({
						where: { id: existingInvoice.paymentConditionId },
					});
					if (existingPaymentTerms) {
						const existingConditions = existingPaymentTerms.condition
							.split(",")
							.map(Number);
						const maxConditionDays = Math.max(...existingConditions);
						newDueDate = new Date(issueDateObj);
						newDueDate.setDate(issueDateObj.getDate() + maxConditionDays);
					}
				}
			}

			let issqnTaxRate: number | null = existingInvoice.issqnTaxRate;
			let effectiveTaxRate: number | null = existingInvoice.effectiveTaxRate;
			let issqnValue: number | null = existingInvoice.issqnValue
				? existingInvoice.issqnValue / 100
				: null;
			let netValue: number = existingInvoice.netValue
				? existingInvoice.netValue / 100
				: existingInvoice.serviceValue / 100;
			let effectiveTax: number | null = existingInvoice.effectiveTax
				? existingInvoice.effectiveTax / 100
				: null;

			if (typeof retainsIss === "boolean" && issueDate && serviceValue) {
				if (retainsIss) {
					if (!taxRates) {
						throw new AppError(
							"Alíquota não encontrada para o mês e ano informados",
							404,
						);
					}

					issqnTaxRate = taxRates.issqnTaxRate;
					effectiveTaxRate = taxRates.effectiveTaxRate;

					const serviceValueInRS = serviceValue / 100;

					issqnValue = serviceValueInRS * issqnTaxRate;
					netValue = serviceValue - issqnValue;
				} else {
					issqnTaxRate = null;
					issqnValue = null;
					netValue = serviceValue;
				}

				if (effectiveTaxRate !== null) {
					const serviceValueInRS = serviceValue / 100;
					effectiveTax = serviceValueInRS * effectiveTaxRate;

					if (retainsIss && issqnValue !== null) {
						effectiveTax = effectiveTax - issqnValue;
					}
					effectiveTax = effectiveTax * 100;
				}
			}

			const updatedInvoice = await prisma.invoice.update({
				where: { id },
				data: {
					invoiceNumber:
						invoiceNumber !== undefined
							? invoiceNumber
							: existingInvoice.invoiceNumber,
					customerId:
						customerId !== undefined ? customerId : existingInvoice.customerId,
					paymentConditionId:
						paymentConditionId !== undefined
							? paymentConditionId
							: existingInvoice.paymentConditionId,
					issueDate: issueDateObj,
					month: month,
					year: year,
					dueDate: newDueDate, // Usar o newDueDate calculado
					serviceValue:
						serviceValue !== undefined
							? serviceValue * 100
							: existingInvoice.serviceValue,
					retainsIss:
						retainsIss !== undefined ? retainsIss : existingInvoice.retainsIss,
					issqnTaxRate: issqnTaxRate,
					effectiveTaxRate: effectiveTaxRate,
					issqnValue: issqnValue !== null ? issqnValue * 100 : null,
					netValue: netValue * 100,
					effectiveTax: effectiveTax !== null ? effectiveTax : null,
					bankAccountId:
						bankAccountId !== undefined
							? bankAccountId
							: existingInvoice.bankAccountId,
					notes: notes !== undefined ? notes : existingInvoice.notes,
				},
			});

			if (
				paymentConditionChanged ||
				(typeof retainsIss === "boolean" &&
					serviceValue &&
					existingInvoice.retainsIss !== retainsIss) ||
				(serviceValue !== undefined &&
					serviceValue !== existingInvoice.serviceValue / 100)
			) {
				await prisma.accountsReceivable.deleteMany({
					where: {
						documentNumber: existingInvoice.invoiceNumber,
						customerId: existingInvoice.customerId,
						status: {
							not: PaymentStatus.PAID,
						},
					},
				});

				const finalConditions = paymentConditionChanged
					? conditions
					: (
							await prisma.paymentTerms.findUnique({
								where: { id: existingInvoice.paymentConditionId },
							})
						)?.condition
							.split(",")
							.map(Number) || [];

				const finalPaymentTerms =
					paymentTerms ||
					(await prisma.paymentTerms.findUnique({
						where: { id: existingInvoice.paymentConditionId },
					}));

				for (let i = 0; i < finalConditions.length; i++) {
					const daysToAdd = finalConditions[i];
					const dueDate = new Date(issueDateObj);
					dueDate.setDate(dueDate.getDate() + daysToAdd);

					await prisma.accountsReceivable.create({
						data: {
							customerId: updatedInvoice.customerId,
							documentNumber: updatedInvoice.invoiceNumber,
							documentDate: issueDateObj,
							launchDate: new Date(),
							dueDate,
							value: (netValue / finalConditions.length) * 100,
							receivedValue: 0,
							discount: 0,
							interest: 0,
							fine: 0,
							installmentNumber: i + 1,
							totalInstallments: finalConditions.length,
							status: PaymentStatus.PENDING,
							paymentMethodId: finalPaymentTerms?.paymentMethodId,
							bankAccountId: updatedInvoice.bankAccountId,
							costCenterId: costCenterId || undefined,
							plannedPaymentMethod: finalPaymentTerms?.paymentMethodId,
							userId: userId,
						},
					});
				}
			} else if (costCenterId) {
				await prisma.accountsReceivable.updateMany({
					where: {
						documentNumber: updatedInvoice.invoiceNumber,
						customerId: updatedInvoice.customerId,
					},
					data: {
						costCenterId,
						userId: userId !== undefined ? userId : undefined,
					},
				});
			}

			return {
				...updatedInvoice,
				serviceValue: updatedInvoice.serviceValue / 100,
				issqnValue: updatedInvoice.issqnValue
					? updatedInvoice.issqnValue / 100
					: 0,
				netValue: updatedInvoice.netValue ? updatedInvoice.netValue / 100 : 0,
				effectiveTax: updatedInvoice.effectiveTax
					? updatedInvoice.effectiveTax / 100
					: 0,
			};
		});
	} catch (error: any) {
		if (error instanceof AppError) {
			throw error;
		}
		console.error(error);
		throw new AppError("Erro ao atualizar fatura", 500);
	}
};
