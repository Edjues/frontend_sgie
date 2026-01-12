import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  database: prismaAdapter(prisma, {
        provider: "postgresql",
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
            const prisma = (await import("./prisma")).default;
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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookie: {
      // Para CORS en 2026, si los dominios son distintos, 'none' es necesario
      // pero requiere HTTPS obligatorio (secure: true).
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      strategy: "database",
      secure: process.env.NODE_ENV === "production",
    },
  },
  
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    // --- CAMBIOS PARA CORS ---
    crossOriginCookies: {
      enabled: true, // Permite que las cookies se compartan entre subdominios/dominios de Vercel
    }
  },

  secret: process.env.AUTH_SECRET!,

  // --- CONFIGURACIÓN DE ORIGENES DE CONFIANZA ---
  trustedOrigins: [
    "http://localhost:3000",
    "https://sgie-three.vercel.app",
    "https://sgie-q9h9c4sbx-edjues-projects.vercel.app" // Tu dominio de Vercel actual
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    errorMessages: {
      invalidCredentials: "Email o contraseña incorrectos",
      userAlreadyExists: "Ya existe un usuario con este email",
    },
  },
})

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;