import { AppError } from "@/helpers/app-error"
import { prisma } from '@/lib/prisma'

export const listSuppliersService = async (userId: string, userRole: string) => {
    try{
        const suppliers = await prisma.supplier.findMany()
        return suppliers

    }catch(error){
        console.error(error)
        throw new AppError('Erro ao listar os fornecedores', 500)
    }
}