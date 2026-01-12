/**
 * @openapi
 * /api/transacciones/{id}:
 *   get:
 *     summary: Obtener transacciones de un usuario por ID
 *     tags:
 *       - Transacciones
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       '200':
 *         description: Lista de transacciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaccion'
 *       '404':
 *         $ref: '#/components/schemas/ErrorResponse'
 */
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/with-auth";

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // ID de la tabla 'usuario' (Int)

  if (req.method !== "GET" ) {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioActual) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

     if (req.method === "GET") {
      const transacciones = await prisma.transaccion.findMany({
        where: { usuarioId: Number(id) },
        orderBy: { fecha: "desc" },
        include: {
          usuario: {
            select: { nombrecompleto: true, email: true }
          }
        }
      });

      const data = JSON.parse(
        JSON.stringify(transacciones, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(200).json(data);
    }

  } catch (error: any) {
    console.error("Error en API transaccion:", error);
    return res.status(500).json({ error: "Error interno al procesar transacciones" });
  }
}, "ADMIN");
