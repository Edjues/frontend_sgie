import { PrismaClient } from '../generated/prisma/client'


const prisma = new PrismaClient({} as any);

async function main() {
  const adminRole = await prisma.rol.upsert({
    where: { descripcion: "ADMIN" },
    update: {},
    create: { descripcion: "ADMIN" },
  });

  const userRole = await prisma.rol.upsert({
    where: { descripcion: "USER" },
    update: {},
    create: { descripcion: "USER" },
  });

  const permisos = [
    { codigo: "VIEW_TRANSACTIONS", descripcion: "Ver movimientos" },
    { codigo: "CREATE_TRANSACTIONS", descripcion: "Crear movimientos" },
    { codigo: "VIEW_USERS", descripcion: "Ver usuarios" },
    { codigo: "EDIT_USERS", descripcion: "Editar usuarios" },
    { codigo: "VIEW_REPORTS", descripcion: "Ver reportes" },
  ];

  for (const permiso of permisos) {
    const existing = await prisma.permiso.findFirst({
      where: { codigo: permiso.codigo },
    });
    if (!existing) {
      await prisma.permiso.create({ data: permiso });
    }
  }

  const allPermisos = await prisma.permiso.findMany();

  for (const permiso of allPermisos) {
    await prisma.rolpermiso.upsert({
      where: {
        rolId_permisoId: {
          rolId: adminRole.id,
          permisoId: permiso.id,
        },
      },
      update: {},
      create: {
        rolId: adminRole.id,
        permisoId: permiso.id,
      },
    });
  }

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
