import { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/transacciones";

// --------------------
// Mocks
// --------------------
const findManyMock = jest.fn();
const createMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    transaccion: {
      findMany: (...args: any[]) => findManyMock(...args),
      create: (...args: any[]) => createMock(...args),
    },
  },
}));

// ✅ withAuth → inyecta sesión ADMIN con dbUser.id
jest.mock("@/lib/with-auth", () => ({
  withAuth:
    (fn: any) =>
    async (req: NextApiRequest, res: NextApiResponse) =>
      fn(req, res, {
        dbUser: { id: 99, rolid: 1 }, // ADMIN
      }),
}));

// --------------------
// Helpers
// --------------------
function mockReqRes(method: string, body?: any) {
  const req = { method, body } as NextApiRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;

  return { req, res };
}

// --------------------
// Tests
// --------------------
describe("API /api/transacciones (usuarioId desde session.dbUser.id)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rechaza métodos no permitidos (405)", async () => {
    const { req, res } = mockReqRes("PUT");

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Allow", ["GET", "POST"]);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: "Método PUT no permitido",
    });
  });

  test("GET → retorna transacciones ordenadas e incluye usuario", async () => {
    findManyMock.mockResolvedValue([
      {
        id: 1,
        monto: BigInt(200000),
        tipo: "I",
        fecha: new Date("2026-01-10T00:00:00.000Z"),
        usuario: {
          nombrecompleto: "Admin",
          email: "admin@noxven.com",
        },
      },
    ]);

    const { req, res } = mockReqRes("GET");

    await handler(req, res);

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { fecha: "desc" },
      include: {
        usuario: {
          select: { nombrecompleto: true, email: true },
        },
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);

    // ✅ BigInt serializado a string por tu JSON.stringify replacer
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        monto: "200000",
        tipo: "I",
        fecha: "2026-01-10T00:00:00.000Z",
        usuario: {
          nombrecompleto: "Admin",
          email: "admin@noxven.com",
        },
      },
    ]);
  });

  test("POST → falla si faltan campos obligatorios", async () => {
    const { req, res } = mockReqRes("POST", { tipo: "I" }); // falta monto

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Faltan campos obligatorios",
    });

    expect(createMock).not.toHaveBeenCalled();
  });


  test("maneja errores internos (500)", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    findManyMock.mockRejectedValue(new Error("DB down"));

    const { req, res } = mockReqRes("GET");

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error interno al procesar transacciones",
    });

    spy.mockRestore();
  });
});
