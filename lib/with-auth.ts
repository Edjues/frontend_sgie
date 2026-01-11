import { auth } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "./prisma";

export const withAuth = (handler: any, requiredRole?: string) => {

    return async (req: NextApiRequest, res: NextApiResponse) => {
    let session: any
    try {
      // Normalizar headers a un objeto plano string->string
      const headersObj = Object.fromEntries(
        Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
      ) as Record<string, string>

      session = await auth.api.getSession({ headers: headersObj as any })
    } catch (err) {
      console.error('withAuth getSession error:', err)
      return res.status(500).json({ error: 'Error verificando sesión' })
    }

    if (!session) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // RBAC: Verificar rol si es necesario
    if (requiredRole) {
      const userEmail = session?.user?.email
      if (!userEmail) return res.status(401).json({ error: 'No autenticado' })

      const dbUser = await prisma.usuario.findUnique({
        where: { email: userEmail },
        include: { rol: true }
      });

      if (dbUser?.rol?.descripcion !== requiredRole) {
        return res.status(403).json({ error: "No autorizado para este rol" });
      }
    }

    return handler(req, res, session);
  };
}