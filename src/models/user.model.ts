export enum UserRole {
   ADMIN = 'ADMIN',
   USER = 'USER',
}

export interface User {
   id: string
   name: string
   email: string
   password: string
   role: UserRole
   phone?: string | null
   cpfCnpj?: string | null
   birthdate?: Date | null
   token?: string | null
   recoveryCode?: string | null
   createdAt: Date
   updatedAt: Date
}
