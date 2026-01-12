import { toNodeHandler } from "better-auth/node";
import { auth } from "../../../lib/auth";

export const config = {
  api: {
    bodyParser: false, 
    externalResolver: true,
  },
};
/**
 * @openapi
 * /api/auth:
 *   get:
 *     summary: Manejador de autenticación (Better-Auth)
 *     description: Punto de entrada para todas las operaciones de autenticación.
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: Operación exitosa
 * /api/reportes:
 *   get:
 *     summary: Obtener lista de transacciones (reportes)
 *     tags:
 *       - Reportes
 *     responses:
 *       '200':
 *         description: Lista de transacciones ordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaccion'
 *   post:
 *     summary: Crear una transacción
 *     tags:
 *       - Reportes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, tipo]
 *             properties:
 *               monto:
 *                 type: number
 *               tipo:
 *                 type: string
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
export default toNodeHandler(auth);
