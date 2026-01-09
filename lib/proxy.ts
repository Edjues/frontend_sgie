// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export default async function proxy(request: NextRequest) {
//   const pathname = request.nextUrl.pathname
//   const publicPaths = ['/login','/register','/api/auth','/api/auth/session']

//   if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

// //   const token = request.cookies.get('your_session_cookie_name')?.value
// //   if (!token) return NextResponse.redirect(new URL('/login', request.url))   

// //   const url = new URL('/api/auth/session', request.url) // asegúrate que exista
// //   const res = await fetch(url.toString(), { headers: request.headers, method: 'GET' })
// //   // Si la sesión no es válida, redirigimos (evitamos bucles excluyendo /api/auth/session)
// //   if (!res.ok) return NextResponse.redirect(new URL('/login', request.url))

//   return NextResponse.next();
// }

// export const config = {
//     matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],   
// };

import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [ '/((?!api/auth|_next/static|_next/image|favicon.ico).*)', ],
};