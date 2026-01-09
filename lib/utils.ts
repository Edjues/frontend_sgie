// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';

// export interface User {
//   id: string;
//   email: string;
//   name: string | null;
//   phone: string | null;
//   role: 'USER' | 'ADMIN';
// }

// export async function getCurrentUser(): Promise<User | null> {
//   const cookieStore = cookies();
//   const token = (await cookieStore).get('auth-token')?.value;

//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
//     return decoded;
//   } catch (error) {
//     return null;
//   }
// }

// export function requireAuth(role?: 'ADMIN') {
//   return async function handler(req: Request) {
//     const user = await getCurrentUser();
    
//     if (!user) {
//       return new Response(JSON.stringify({ error: 'No autorizado' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (role && user.role !== role) {
//       return new Response(JSON.stringify({ error: 'Acceso denegado' }), {
//         status: 403,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     return { user };
//   };
// }