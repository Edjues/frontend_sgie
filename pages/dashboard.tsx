"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { authClient } from "@/lib/auth-client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, ArrowUpDown, Plus, X, Save } from "lucide-react";
import { useAuth } from "./hooks/useAuth"; // ✅ ajusta si tu ruta cambia

type ApiTransaccion = {
  id: number;
  monto: string;
  tipo: "I" | "E";
  fecha: string;
  usuarioId: number;
  concepto?: string | null;
  usuario?: {
    nombrecompleto: string;
    email: string;
  };
};

type UsuarioDB = {
  id: number;
  rolid: 1 | 2;
  nombrecompleto: string;
  email: string;
  telefono: string | null;
  estado: boolean;
  createdAt: string;
  createdAtT: string;
};

type SortKey = "tipo" | "concepto" | "monto" | "fecha" | "usuario";
type SortDir = "asc" | "desc";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

function safeNumber(n: unknown) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function compare(a: any, b: any) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "string" && typeof b === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(a) && /^\d{4}-\d{2}-\d{2}T/.test(b)) {
      return new Date(a).getTime() - new Date(b).getTime();
    }
    return a.localeCompare(b);
  }

  return Number(a) - Number(b);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Movimientos() {
  const { user, loading: loadingAuth } = useAuth();

  // ✅ ÚNICO estado para usuario DB
  const [dbUser, setDbUser] = useState<UsuarioDB | null>(null);
  const isAdmin = dbUser?.rolid === 1;
  const canCreate = !loadingAuth && !!dbUser && isAdmin;

  const [tx, setTx] = useState<ApiTransaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // search + sort
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // modal nuevo
  const [openCreate, setOpenCreate] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState<"I" | "E">("I");
  const [montoNuevo, setMontoNuevo] = useState("");
  const [conceptoNuevo, setConceptoNuevo] = useState("");
  const [fechaNueva, setFechaNueva] = useState(""); // yyyy-mm-dd
  const [saving, setSaving] = useState(false);

  async function loadDBUserByEmail(email?: string | null) {
    if (!email) {
      setDbUser(null);
      return;
    }

    try {
      const res = await fetch("/api/usuario", { cache: "no-store" });
      if (!res.ok) {
        setDbUser(null);
        return;
      }

      const all = (await res.json()) as UsuarioDB[];
      const found =
        all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;

      setDbUser(found);
    } catch {
      setDbUser(null);
    }
  }

  async function loadTransacciones() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/transacciones", { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as ApiTransaccion[];
      setTx(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando transacciones");
      setTx([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransacciones();
  }, []);

  // ✅ Validar rol ADMIN aquí (como pediste)
  useEffect(() => {
    loadDBUserByEmail(user?.email);
  }, [user?.email]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? tx.filter((t) => {
          const concepto = (t.concepto ?? "").toLowerCase();
          const usuario = (t.usuario?.nombrecompleto ?? "").toLowerCase();
          const email = (t.usuario?.email ?? "").toLowerCase();
          const tipo = t.tipo === "I" ? "ingreso" : "egreso";
          return (
            concepto.includes(q) ||
            usuario.includes(q) ||
            email.includes(q) ||
            tipo.includes(q)
          );
        })
      : tx;

    const rows = [...filtered].sort((a, b) => {
      const aUser = a.usuario?.nombrecompleto ?? "";
      const bUser = b.usuario?.nombrecompleto ?? "";

      const aVal =
        sortKey === "usuario"
          ? aUser
          : sortKey === "monto"
          ? safeNumber(a.monto)
          : sortKey === "fecha"
          ? a.fecha
          : sortKey === "concepto"
          ? a.concepto ?? ""
          : a.tipo;

      const bVal =
        sortKey === "usuario"
          ? bUser
          : sortKey === "monto"
          ? safeNumber(b.monto)
          : sortKey === "fecha"
          ? b.fecha
          : sortKey === "concepto"
          ? b.concepto ?? ""
          : b.tipo;

      const c = compare(aVal, bVal);
      return sortDir === "asc" ? c : -c;
    });

    return rows;
  }, [tx, query, sortKey, sortDir]);

  async function createMovimiento() {
    if (!canCreate) {
      alert("Solo administradores pueden crear movimientos.");
      return;
    }

    // ✅ NECESITAS usuarioId
    const usuarioId = dbUser?.id;
    if (!usuarioId) {
      alert("No se pudo detectar usuarioId (dbUser.id).");
      return;
    }

    const monto = safeNumber(montoNuevo);
    if (monto <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }
    if (!conceptoNuevo.trim()) {
      alert("Ingresa un concepto.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        tipo: tipoNuevo,
        monto,
        concepto: conceptoNuevo.trim(),
        usuarioId, // ✅ AQUÍ VA
      };

      if (fechaNueva) {
        payload.fecha = new Date(`${fechaNueva}T00:00:00`).toISOString();
      }

      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Error creando (HTTP ${res.status}) ${text}`);
      }

      setMontoNuevo("");
      setConceptoNuevo("");
      setFechaNueva("");
      setTipoNuevo("I");
      setOpenCreate(false);

      await loadTransacciones();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo crear el movimiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row">
      <div className="md:sticky md:top-0 md:h-screen md:w-[280px]">
        <Sidebar userRole={"ADMIN"} />
      </div>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Ingresos y Egresos</h2>
            <p className="text-slate-400 text-sm">
              {loading ? "Cargando..." : `${filteredAndSorted.length} movimiento(s)`}
              {loadingAuth && " · verificando sesión..."}
              {!loadingAuth && dbUser && !isAdmin && " · (solo lectura)"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {canCreate && (
              <Button className="gap-2 w-full sm:w-auto" onClick={() => setOpenCreate(true)}>
                <Plus size={16} /> Nuevo
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-slate-700 self-start sm:self-auto"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={(user as any)?.image ?? ""} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {(user as any)?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-100" align="end">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-400 hover:bg-red-500/10"
                  onSelect={(e) => {
                    e.preventDefault();
                    authClient.signOut().finally(() => window.location.reload());
                  }}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-slate-200">Movimientos</CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por concepto / usuario / email / tipo..."
                className="bg-slate-950/40 border-slate-800 text-slate-100 w-full sm:w-[420px]"
              />
              <Button
                variant="secondary"
                className="bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 w-full sm:w-auto"
                onClick={loadTransacciones}
              >
                Actualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {error && <p className="text-red-400 mb-3">{error}</p>}
            {loading && <p className="text-slate-400">Cargando movimientos...</p>}

            {!loading && !error && (
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <div className="min-w-[860px] px-4 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-800">
                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button className="inline-flex items-center gap-2 hover:text-slate-200" onClick={() => toggleSort("tipo")}>
                            Tipo <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button className="inline-flex items-center gap-2 hover:text-slate-200" onClick={() => toggleSort("concepto")}>
                            Concepto <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button className="inline-flex items-center gap-2 hover:text-slate-200" onClick={() => toggleSort("monto")}>
                            Monto <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button className="inline-flex items-center gap-2 hover:text-slate-200" onClick={() => toggleSort("fecha")}>
                            Fecha <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap hidden lg:table-cell">
                          <button className="inline-flex items-center gap-2 hover:text-slate-200" onClick={() => toggleSort("usuario")}>
                            Usuario <ArrowUpDown size={14} />
                          </button>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAndSorted.map((t) => {
                        const isIngreso = t.tipo === "I";
                        return (
                          <tr key={t.id} className="border-b border-slate-800/60 text-slate-200">
                            <td className="py-3 pr-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-md ${
                                  isIngreso ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
                                }`}
                              >
                                {isIngreso ? "Ingreso" : "Egreso"}
                              </span>
                            </td>

                            <td className="py-3 pr-4 min-w-[260px]">
                              <span className="block truncate max-w-[520px]">{t.concepto ?? "-"}</span>
                            </td>

                            <td className="py-3 pr-4 whitespace-nowrap">{money.format(safeNumber(t.monto))}</td>

                            <td className="py-3 pr-4 whitespace-nowrap">{formatDate(t.fecha)}</td>

                            <td className="py-3 pr-4 hidden lg:table-cell">
                              <div className="max-w-[360px]">
                                <div className="truncate">{t.usuario?.nombrecompleto ?? `Usuario ${t.usuarioId}`}</div>
                                <div className="text-xs text-slate-400 truncate">{t.usuario?.email ?? ""}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredAndSorted.length === 0 && (
                    <p className="text-slate-400 py-6">No hay resultados.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Nuevo */}
        {openCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setOpenCreate(false)} />
            <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Nuevo ingreso/egreso</h3>
                  <p className="text-sm text-slate-400">Se enviará con usuarioId: {dbUser?.id ?? "—"}</p>
                </div>
                <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => !saving && setOpenCreate(false)}>
                  <X size={18} />
                </Button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-slate-300">Tipo</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoNuevo("I")}
                      className={`flex-1 h-10 rounded-md border px-3 text-sm transition ${
                        tipoNuevo === "I"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      Ingreso
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoNuevo("E")}
                      className={`flex-1 h-10 rounded-md border px-3 text-sm transition ${
                        tipoNuevo === "E"
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : "bg-slate-900/40 border-slate-800 text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      Egreso
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Concepto</label>
                  <Input
                    value={conceptoNuevo}
                    onChange={(e) => setConceptoNuevo(e.target.value)}
                    placeholder="Ej: Pago proveedor / Venta hoodie / Impresión..."
                    className="mt-2 bg-slate-900/40 border-slate-800 text-slate-100"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-300">Monto</label>
                    <Input
                      value={montoNuevo}
                      onChange={(e) => setMontoNuevo(e.target.value)}
                      placeholder="Ej: 200000"
                      inputMode="decimal"
                      className="mt-2 bg-slate-900/40 border-slate-800 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">Fecha</label>
                    <Input
                      value={fechaNueva}
                      onChange={(e) => setFechaNueva(e.target.value)}
                      type="date"
                      className="mt-2 bg-slate-900/40 border-slate-800 text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                  <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setOpenCreate(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={createMovimiento}
                    disabled={
                      saving ||
                      safeNumber(montoNuevo) <= 0 ||
                      !conceptoNuevo.trim() ||
                      !dbUser?.id // ✅ evita POST sin usuarioId
                    }
                  >
                    <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
