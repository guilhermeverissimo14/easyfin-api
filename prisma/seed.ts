import { PrismaClient} from '@prisma/client';
import { UserRole } from '@prisma/client/wasm';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  
  const userExists = await prisma.user.findUnique({
    where: {
      email: 'admineasyfin@gmail.com',
    },
  });

  if (!userExists) {
    
    const hashedPassword = await bcrypt.hash('admin123', 10);

  
    const admin = await prisma.user.create({
      data: {
        name: 'Easyfin',
        email: 'admineasyfin@gmail.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstAccess: false,
        profileCompleted: true,
      },
    });

    console.log(`Usuário admin criado: ${admin.email}`);
  } else {
    console.log('Usuário admin já existe');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });