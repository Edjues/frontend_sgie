import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- MANEJO DE CORS ---
    // Si necesitas que sea abierto, usa '*'. 
    // Si usas cookies (better-auth), lo ideal es poner el dominio específico del frontend.
    const origin = request.headers.get("origin") || "*"; 
    
    // 1. Manejar peticiones OPTIONS (Preflight)
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
                "Access-Control-Allow-Credentials": "true",
            },
        });
    }

    // --- LÓGICA DE AUTENTICACIÓN ---
    const session = await auth.api.getSession({ headers: request.headers });
    const rutasPrivadas = ["/dashboard", "/usuario", "/reportes", "/gestionI&E"];
    const esRutaPrivada = rutasPrivadas.some(ruta => pathname.startsWith(ruta));

    if (esRutaPrivada && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // --- AÑADIR CABECERAS A LA RESPUESTA FINAL ---
    const response = NextResponse.next();
    
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
}

export const config = {
  matcher: [
    // Se añade 'api' al matcher si quieres que el middleware también controle CORS en la API
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export default proxy;