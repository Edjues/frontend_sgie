import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import Prisma from "./prisma";

// import { PrismaClient } from "../generated/prisma/client";
// const prisma = new PrismaClient({} as any);


export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  database: prismaAdapter(Prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production"
  },
  secret: process.env.AUTH_SECRET!, // Obligatorio: mínimo 32 caracteres
  trustedOrigins: process.env.NEXTAUTH_URL 
    ? [process.env.NEXTAUTH_URL] 
    : ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
    errorMessages: {
      invalidCredentials: "Email o contraseña incorrectos",
      userAlreadyExists: "Ya existe un usuario con este email",
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        values: ["USER", "ADMIN"],
        default: "ADMIN", // IMPORTANTE: Todos nuevos usuarios son ADMIN
      },
      name: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
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
})

