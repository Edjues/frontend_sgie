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
      const usuario = await prisma.usuario
      .findMany({
        orderBy: { id: "desc" },
      });

      const data = JSON.parse(
        JSON.stringify(usuario, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(200).json(data);
    }

    // 3. Crear una nueva usuario
    if (req.method === "POST") {
      const { nombrecompleto, rolid, email, telefono } = req.body;

      if (!nombrecompleto || !rolid || !email || !telefono) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const nuevausuario = await prisma.usuario.create({
        data: {
          nombrecompleto: nombrecompleto,
          rolid: rolid,
          email: email,
          telefono: telefono,
        },
      });

      return res.status(201).json(nuevausuario);
    }

  } catch (error) {
    console.error("Error en API usuario:", error);
    return res.status(500).json({ error: "Error interno al procesar usuarios" });
  }
}, "ADMIN");

