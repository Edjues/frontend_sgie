/**
 * @openapi
 * /api/transacciones:
 *   get:
 *     summary: Obtener lista de transacciones
 *     tags:
 *       - Transacciones
 *     responses:
 *       '200':
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaccion'
 *   post:
 *     summary: Crear una nueva transacción
 *     tags:
 *       - Transacciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, tipo, usuarioId]
 *             properties:
 *               monto:
 *                 type: number
 *               tipo:
 *                 type: string
 *               usuarioId:
 *                 type: integer
 *     responses:
 *       '201':
 *         description: Transacción creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaccion'
 *       '400':
 *         $ref: '#/components/schemas/ErrorResponse'
 */
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/with-auth";


export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  // 1. Validar el método HTTP
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    // 2. Obtener datos de la base de datos de todas las transacciones
    if (req.method === "GET") {
      // const transacciones = await prisma.transaccion.findMany({
      //   orderBy: { fecha: "desc" },
      //   include: {
      //     usuario: {
      //       select: { nombrecompleto: true, email: true }
      //     }
      //   }
      // });
      const transacciones = await prisma.transaccion
      .findMany({
          orderBy: { id: "desc" },
      });
      const data = JSON.parse(
        JSON.stringify(transacciones, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(200).json(data);
    }

    // 3. Crear una nueva transacción
    if (req.method === "POST") {
      const { monto, tipo , usuarioId} = req.body;

      if (!monto || !tipo || !usuarioId) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const nuevaTransaccion = await prisma.transaccion.create({
        data: {
          monto: monto,
          tipo: tipo,
          usuarioId: usuarioId, 
        },
      });

      return res.status(201).json(nuevaTransaccion);
    }

  } catch (error) {
    console.error("Error en API transaccion:", error);
    return res.status(500).json({ error: "Error interno al procesar transacciones" });
  }
},  ["ADMIN", "USER"]);

