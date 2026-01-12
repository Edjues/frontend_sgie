import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  // En lugar de getSessionCookie, usamos el método del servidor de better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    const { pathname } = request.nextUrl;

    const rutasPrivadas = ["/dashboard", "/usuario", "/reportes", "/gestionI&E"];
    const esRutaPrivada = rutasPrivadas.some(ruta => pathname.startsWith(ruta));

    // Si no hay sesión y va a una ruta privada
    if (esRutaPrivada && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

// IMPORTANTE: El matcher DEBE estar en este archivo raíz
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default proxy;