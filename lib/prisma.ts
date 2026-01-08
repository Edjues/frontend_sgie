/*import { PrismaClient } from '../generated/prisma/client'

const prismaClientSingleton = () => new PrismaClient()

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // Aquí va la URL de Pooling
})

export default prisma 

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client' // Importa desde tu carpeta generada

const prismaClientSingleton = () => {
  // Configuración del pool para Supabase (Usa DATABASE_URL de pooling)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
*/