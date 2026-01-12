import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Detecta automáticamente si estás en local o en producción
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 
           (typeof window !== "undefined" && window.location.origin.includes("localhost") 
            ? "http://localhost:3000" 
            : "https://sgie-three.vercel.app"),
  
  fetchOptions: {
    // Necesario para que las cookies de sesión funcionen en ambos entornos
    credentials: "include", 
  },
});
