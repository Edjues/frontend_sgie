/**
 * @openapi
 * /api/registrar:
 *   post:
 *     summary: Registrar un nuevo usuario (se asigna rol ADMIN).
 *     tags:
 *       - Usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       '201':
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       '400':
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitimos el método POST para registros nuevos
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { nombrecompleto, rolid, email, telefono, password } = req.body;

  // 1. Validación de campos obligatorios
  if (!nombrecompleto || !rolid || !email || !password) {
    return res.status(400).json({ 
      error: "Faltan datos obligatorios (nombre, rol, email y contraseña)" 
    });
  }

  try {
    // 2. Verificar duplicados antes de iniciar la transacción
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: "Este correo electrónico ya está registrado" });
    }

    // 3. Hashear la contraseña de forma segura (Better Auth compatible)
    const hashedPassword = await hashPassword(password);

    // 4. Transacción de base de datos (Todo o nada)
    const nuevoUsuarioPerfil = await prisma.$transaction(async (tx) => {
      
      // A. Crear registro en la tabla 'user' (Auth Core)
      const authUser = await tx.user.create({
        data: {
          email: email,
          name: nombrecompleto,
          role: "ADMIN", // Requerimiento: Asignación automática de ADMIN
          phone: telefono,
        },
      });

      // B. Crear registro en la tabla 'account' (Credenciales/Password)
      await tx.account.create({
        data: {
          userId: authUser.id,
          accountId: email,
          providerId: "credential",
          password: hashedPassword,
        },
      });

      // C. Crear registro en la tabla 'usuario' (Perfil de Negocio)
      const perfil = await tx.usuario.create({
        data: {
          nombrecompleto,
          email,
          telefono,
          rolid: Number(rolid),
          estado: true,
        },
      });

      return perfil;
    });

    // 5. Respuesta de éxito (201 Created)
    return res.status(201).json({
      message: "Usuario registrado exitosamente como ADMIN",
      usuario: nuevoUsuarioPerfil,
    });

  } catch (error: any) {
    console.error("Error en el proceso de registro:", error);
    
    // Manejo de errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya existe en la tabla de negocio" });
    }

    return res.status(500).json({ error: "Error interno del servidor al crear la cuenta" });
  }
}
