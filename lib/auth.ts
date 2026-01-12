import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  user:{
    additionalFields:{
      role: {
        type: "string",
        defaultValue: "USER",
        input: true,
      },
      phone: {
        type: "string",
        input: true,
      }
    }
  },
  additionalFields: ["role", "phone"] ,
  rateLimit: { enabled: false },
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
 
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const prisma = (await import("./prisma")).default; // Importación dinámica para evitar errores de entorno

            const adminRole = await prisma.rol.findUnique({
              where: { descripcion: "ADMIN" },
            });

            if (adminRole) {
              await prisma.usuario.create({
                data: {
                  nombrecompleto: user.name || "Usuario de GitHub",
                  email: user.email,
                  rolid: adminRole.id,
                  estado: true
                },
              });
              console.log("Sincronización exitosa en tabla usuario");
            }
          } catch (e) {
            console.error("Error sincronizando tabla usuario:", e);
          }
        },
      },
    },
  
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días en segundos
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
      cookie: {
        // Configuración de cookies
        sameSite: "lax",
        strategy: "database",
        secure: process.env.NODE_ENV === "production", // HTTPS en producción
      },
      
  },
  
  advanced: {
    // Use secure cookies only in production (allow http during local development)
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  secret: process.env.AUTH_SECRET!, // Obligatorio: mínimo 32 caracteres
  trustedOrigins: process.env.NEXTAUTH_URL 
    ? [process.env.NEXTAUTH_URL] 
    : ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Cambiar a true en producción
    errorMessages: {
      invalidCredentials: "Email o contraseña incorrectos",
      userAlreadyExists: "Ya existe un usuario con este email",
    },
  },
  
})

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
