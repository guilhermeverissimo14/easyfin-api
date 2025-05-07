import { AppError } from "@/helpers/app-error";
import { formatCpfCnpj, formatPhone } from "@/utils/format";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSupplierService = async (supplierData:{
    cnpj: string,
    name: string,
    email?: string | null,
    phone?: string | null,
    address?: string | null,
    zipCode?: string | null,
    city?: string | null,
    state?: string | null,
    country?: string | null,
    contact?: string | null,
    retIss?: boolean,
}) => {
    const { cnpj, email } = supplierData;

    const existingSupplier = await prisma.supplier.findUnique({ where: { cnpj } });

    if (existingSupplier) {
        throw new AppError("CNPJ já está cadastrado", 400);
    }

    if (email) {
        const existingEmail = await prisma.supplier.findUnique({ where: { email } });
        if (existingEmail) {
            throw new AppError("E-mail já está em uso", 400);
        }
    }

    if(supplierData.cnpj) {
        supplierData.cnpj = formatCpfCnpj(supplierData.cnpj);
    }

    if(supplierData.phone) {
        supplierData.phone = formatPhone(supplierData.phone);
    }

    if(supplierData.zipCode) {
        supplierData.zipCode = supplierData.zipCode.replace(/\D/g, "");
    }

    try {
        const supplier = await prisma.supplier.create({
            data: {
                ...supplierData,
            },
        });

        return supplier;
    } catch (error) {
        console.error(error);
        throw new Error("Erro ao criar o fornecedor");
    }
}