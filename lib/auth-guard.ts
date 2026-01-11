import { auth } from "./auth";
import prisma from "./prisma";
import type { NextApiRequest, NextApiResponse } from "next";


export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  let session: any, email: string, name: string;  
  try {
    // Normalizar headers a objeto plano (Next headers pueden ser string|string[])
    const headersObj = Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
    ) as Record<string, string>

    session = await auth.api.getSession({ headers: headersObj as any })

    if (!session?.user?.email) {
      res.status(401).json({ message: "No autenticado" });
      return null;
    }

    email = session.user.email;
    name = session.user.name || "Sin nombre";
    
    // continuar abajo
  } catch (err) {
    console.error('requireAuth error getting session:', err)
    res.status(500).json({ message: 'Error verificando sesión' })
    return null
  }

    let usuario = await prisma.usuario.findUnique({
      where: { email: email },
      include: { rol: true },
    });

  if (!usuario) {

    let adminRole = await prisma.rol.findUnique({
      where: { descripcion: "ADMIN" },
    });

    if (!adminRole) {
      adminRole = await prisma.rol.create({
        data: {
          descripcion: "ADMIN",
        },
      });
    }//throw new Error("Rol ADMIN no existe");

    usuario = await prisma.usuario.create({
      data: {
        email,
        nombrecompleto: name,
        rolid: adminRole.id,
      },
      include: { rol: true },
    });

    res.status(201).json({ message: "Usuario registrado" });
    return null;
  }

  return usuario;
}
