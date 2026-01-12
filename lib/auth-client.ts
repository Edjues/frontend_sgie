import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Esta URL debe ser la de tu BACKEND (donde está instalada la API de better-auth)
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  fetchOptions: {
    // IMPORTANTE: Permite el envío de cookies/tokens entre diferentes dominios (CORS)
    credentials: "include", 
  },
});
