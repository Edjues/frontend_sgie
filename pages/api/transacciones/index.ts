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
    // 2. Obtener datos de la base de datos (Ejemplo: Todas las transacciones)
    if (req.method === "GET") {
      const transacciones = await prisma.transaccion.findMany({
        orderBy: { fecha: "desc" },
        include: {
          usuario: {
            select: { nombrecompleto: true, email: true }
          }
        }
      });

      // NOTA: Si usas BigInt en tu esquema, debes convertir los datos a String
      const data = JSON.parse(
        JSON.stringify(transacciones, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(200).json(data);
    }

    // 3. Crear una nueva transacción
    if (req.method === "POST") {
      const { monto, tipo } = req.body;

      if (!monto || !tipo) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const nuevaTransaccion = await prisma.transaccion.create({
        data: {
          monto: monto,
          tipo: tipo,
          // Usamos el ID del usuario que viene de la sesión (tabla 'usuario')
          usuarioId: session.dbUser.id, 
        },
      });

      return res.status(201).json(nuevaTransaccion);
    }

  } catch (error) {
    console.error("Error en API transaccion:", error);
    return res.status(500).json({ error: "Error interno al procesar transacciones" });
  }
}, "ADMIN");

