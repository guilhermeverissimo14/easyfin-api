import { AppError } from "@/helpers/app-error";
import { formatCpfCnpj, formatPhone } from "@/utils/format";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const updateSupplierService = async (id: string, supplierData:{
    cnpj?: string,
    name?: string,
    email?: string | null,
    phone?: string | null,
    address?: string | null,
    zipCode?: string | null,
    city?: string | null,
    state?: string | null,
    country?: string | null,
    contact?: string | null,
    retIss?: boolean,
},
userId: string,
userRole: string,
) =>{

    try {
        const existingSupplier = await prisma.supplier.findUnique({
            where: {
                id: id,
            }
        });

        if(!existingSupplier){
            throw new AppError("Fornecedor não encontrado", 404);
        }

        if(userRole !== UserRole.ADMIN){
            throw new AppError("Acesso negado", 403);
        }

        if(supplierData.cnpj){
            const existingCnpj = await prisma.supplier.findUnique({ where: { cnpj: supplierData.cnpj } });

            if(existingCnpj && existingCnpj.id !== id){
                throw new AppError("CNPJ já está cadastrado", 400);
            }

            supplierData.cnpj = formatCpfCnpj(supplierData.cnpj);
        }

        if(supplierData.email){
            const existingEmail = await prisma.supplier.findUnique({ where: { email: supplierData.email } });

            if(existingEmail && existingEmail.id !== id){
                throw new AppError("E-mail já está em uso", 400);
            }
        }

        if(supplierData.phone){
            supplierData.phone = formatPhone(supplierData.phone);
        }

        if(supplierData.zipCode){
            supplierData.zipCode = supplierData.zipCode.replace(/\D/g, "");
        }

        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: {
                ...supplierData,
            },
        });

        return updatedSupplier; 

    }catch(error){
        if (error instanceof AppError){
            throw error;
        }
        console.error(error);
        throw new AppError("Erro ao atualizar o fornecedor", 500);
    }
}