import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/with-auth";
/**
 * @openapi
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     description: Actualiza el nombre y el rol de un usuario tanto en la tabla 'usuario' como en la tabla de autenticación. Requiere permisos de administrador.
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del usuario a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombrecompleto
 *               - rolid
 *             properties:
 *               nombrecompleto:
 *                 type: string
 *                 example: "Juan Pérez"
 *               rolid:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Usuario actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       '400':
 *         description: Error de validación o conflicto (ej. email en uso)
 *       '401':
 *         description: No autenticado
 *       '403':
 *         description: No autorizado (Se requiere rol ADMIN)
 *       '404':
 *         description: Usuario no encontrado
 *       '405':
 *         description: Método no permitido
 *       '500':
 *         description: Error interno del servidor
 */
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
          role: updatedUsuario.rol?.descripcion , 
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
