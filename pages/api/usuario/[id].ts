import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/with-auth";

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // ID de la tabla 'usuario' (Int)

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { nombrecompleto, rolid} = req.body;

  try {
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioActual) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const resultado = await prisma.$transaction(async (tx) => {
      
      const updatedUsuario = await tx.usuario.update({
        where: { id: Number(id) },
        data: {
          nombrecompleto,
          rolid: Number(rolid),
        },
        include: { rol: true }
      });

      const updatedAuthUser = await tx.user.update({
        where: { email: usuarioActual.email },
        data: {
          name: nombrecompleto,
          role: updatedUsuario.rol?.descripcion || "ADMIN", 
        },
      });

      return { updatedUsuario, updatedAuthUser };
    });

    return res.status(200).json({
      message: "Usuario actualizado correctamente en ambas tablas",
      data: resultado.updatedUsuario
    });

  } catch (error: any) {
    console.error("Error al editar usuario:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya está en uso por otro usuario" });
    }
    return res.status(500).json({ error: "Error interno al actualizar el usuario" });
  }
}, "ADMIN");
