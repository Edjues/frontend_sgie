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

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Wallet,
  LogOut,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type ApiTransaccion = {
  id: number;
  monto: string;
  tipo: "I" | "E";
  fecha: string;
  usuarioId: number;
  usuario?: { nombrecompleto: string; email: string };
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


type ChartPoint = {
  name: string;
  ingresos: number;
  egresos: number;
  neto: number;
};

type DateRange = "30d" | "90d" | "ytd";

const money = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "COP",
});

const MONTHS_ES = [
  "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"
];

function safeNumber(n: unknown) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabelFromKey(key: string) {
  const m = Number(key.slice(5, 7)) - 1;
  return MONTHS_ES[m] ?? key;
}

function buildCSV(rows: ApiTransaccion[]) {
  const header = ["id", "fecha", "tipo", "monto", "usuarioId", "usuario_nombre", "usuario_email"];

  const escape = (v: any) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((t) =>
      [
        t.id,
        t.fecha,
        t.tipo,
        t.monto,
        t.usuarioId,
        t.usuario?.nombrecompleto ?? "",
        t.usuario?.email ?? "",
      ].map(escape).join(",")
    ),
  ];

  return lines.join("\n");
}

function getRangeStart(range: DateRange) {
  const now = new Date();
  const start = new Date(now);

  if (range === "30d") {
    start.setDate(now.getDate() - 30);
    return start;
  }
  if (range === "90d") {
    start.setDate(now.getDate() - 90);
    return start;
  }
  return new Date(now.getFullYear(), 0, 1); // ytd
}



export default function Reportes() {
  const { user, loading: loadingAuth } = useAuth();
  
  const [usuarioDB, setUsuarioDB] = useState<UsuarioDB | null>(null);

  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [range, setRange] = useState<DateRange>("30d");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // null = todos

  // ✅ nuevo: panel para agregar movimiento
  const [openCreate, setOpenCreate] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState<"I" | "E">("I");
  const [montoNuevo, setMontoNuevo] = useState<string>("");
  const [fechaNueva, setFechaNueva] = useState<string>(""); // yyyy-mm-dd
  const [saving, setSaving] = useState(false);

  async function loadUsuarioDBByEmail() {
  if (!user?.email) return;

  const res = await fetch("/api/usuario", { cache: "no-store" });
  if (!res.ok) return;

  const all = (await res.json()) as UsuarioDB[];
  const found = all.find((u) => u.email.toLowerCase() === user.email!.toLowerCase()) ?? null;

  setUsuarioDB(found);
}

  async function loadTransacciones() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/transacciones", { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as ApiTransaccion[];

      setTransacciones(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando transacciones");
      setTransacciones([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadTransacciones();
}, []);

useEffect(() => {
  loadUsuarioDBByEmail();
}, [user?.email]);

  // ✅ usuarios derivados de transacciones (para filtro)
  const users = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; email: string }>();
    for (const t of transacciones) {
      if (!t.usuarioId) continue;
      const nombre = t.usuario?.nombrecompleto ?? `Usuario ${t.usuarioId}`;
      const email = t.usuario?.email ?? "";
      map.set(t.usuarioId, { id: t.usuarioId, nombre, email });
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [transacciones]);

  const filteredTx = useMemo(() => {
    const start = getRangeStart(range).getTime();
    const end = Date.now();

    return transacciones
      .filter((t) => {
        const d = new Date(t.fecha).getTime();
        if (!Number.isFinite(d)) return false;

        const inDate = d >= start && d <= end;
        const inUser = selectedUserId == null ? true : t.usuarioId === selectedUserId;

        return inDate && inUser;
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [transacciones, range, selectedUserId]);

  const resumen = useMemo(() => {
    let ingresosTotal = 0;
    let egresosTotal = 0;

    for (const t of filteredTx) {
      const monto = safeNumber(t.monto);
      if (t.tipo === "I") ingresosTotal += monto;
      if (t.tipo === "E") egresosTotal += monto;
    }

    return {
      ingresosTotal,
      egresosTotal,
      saldoActual: ingresosTotal - egresosTotal,
    };
  }, [filteredTx]);

  const chartData: ChartPoint[] = useMemo(() => {
    const map = new Map<string, { ingresos: number; egresos: number }>();

    for (const t of filteredTx) {
      const d = new Date(t.fecha);
      if (Number.isNaN(d.getTime())) continue;

      const key = monthKey(d);
      const bucket = map.get(key) ?? { ingresos: 0, egresos: 0 };

      const monto = safeNumber(t.monto);
      if (t.tipo === "I") bucket.ingresos += monto;
      if (t.tipo === "E") bucket.egresos += monto;

      map.set(key, bucket);
    }

    return Array.from(map.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((k) => {
        const v = map.get(k)!;
        return { name: monthLabelFromKey(k), ingresos: v.ingresos, egresos: v.egresos, neto: v.ingresos - v.egresos };
      });
  }, [filteredTx]);

  function downloadCSV() {
    const csv = buildCSV(filteredTx); // CSV con filtros actuales
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${range}-${selectedUserId ?? "todos"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  const rangeLabel = range === "30d" ? "Últimos 30 días" : range === "90d" ? "Últimos 90 días" : "Este año";

  

  async function createMovimiento() {
    // Nota: session.user.id depende de tu auth. Ajusta si tu id está en otro campo.
    const usuarioId = usuarioDB?.id;
    if (!usuarioId) {
      alert("No se pudo detectar el usuario logueado.");
      return;
    }

    const monto = safeNumber(montoNuevo);
    if (monto <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        tipo: tipoNuevo, // "I" o "E"
        monto: monto,    // number
        usuarioId,       // del logueado
      };

      // si el usuario puso fecha, mandamos ISO (medianoche local)
      if (fechaNueva) {
        // YYYY-MM-DD -> ISO
        payload.fecha = new Date(`${fechaNueva}T00:00:00`).toISOString();
      }

      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error creando (HTTP ${res.status})`);

      // Reset form + reload
      setMontoNuevo("");
      setFechaNueva("");
      setTipoNuevo("I");
      setOpenCreate(false);

      await loadTransacciones();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo crear la transacción");
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
        {/* Header (sin filtros para no romper mobile) */}
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Reportes</h2>
            <p className="text-slate-400 text-sm">
              {loading ? "Cargando..." : `${filteredTx.length} transacción(es) · ${rangeLabel}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* <Button className="gap-2 w-full sm:w-auto" onClick={() => setOpenCreate(true)}>
              <Plus size={16} /> Agregar movimiento
            </Button> */}

            <Button
              className="gap-2 w-full sm:w-auto"
              onClick={downloadCSV}
              disabled={loading || filteredTx.length === 0}
            >
              <Download size={16} /> Descargar CSV
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-700 self-start sm:self-auto">
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

        {/* ✅ Barra de filtros separada, responsive-friendly */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardContent className="py-4">
            <div className="grid gap-3 lg:grid-cols-3">
              {/* rango */}
              <div className="flex w-full rounded-md border border-slate-800 bg-slate-950/30 p-1">
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition ${
                    range === "30d" ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:text-slate-100"
                  }`}
                  onClick={() => setRange("30d")}
                  type="button"
                >
                  30 días
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition ${
                    range === "90d" ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:text-slate-100"
                  }`}
                  onClick={() => setRange("90d")}
                  type="button"
                >
                  90 días
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition ${
                    range === "ytd" ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:text-slate-100"
                  }`}
                  onClick={() => setRange("ytd")}
                  type="button"
                >
                  Este año
                </button>
              </div>

              {/* usuario */}
              <div className="lg:col-span-2">
                <select
                  value={selectedUserId ?? "all"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedUserId(v === "all" ? null : Number(v));
                  }}
                  className="h-10 w-full rounded-md bg-slate-950/30 border border-slate-800 px-3 text-slate-100"
                  disabled={loading}
                >
                  <option value="all">Todos los usuarios</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}{u.email ? ` (${u.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 mt-3">{error}</p>}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Saldo (filtro)</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{money.format(resumen.saldoActual)}</div>
              <p className="text-xs text-slate-400">{rangeLabel}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Ingresos (filtro)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{money.format(resumen.ingresosTotal)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Egresos (filtro)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{money.format(resumen.egresosTotal)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-slate-900/50 border-slate-800 p-4 sm:p-6">
          <CardHeader className="px-0">
            <CardTitle className="text-sm font-medium text-slate-400">
              Movimientos financieros ({rangeLabel})
            </CardTitle>
          </CardHeader>

          <div className="h-[320px] sm:h-[420px] w-full pt-2">
            {loading ? (
              <p className="text-slate-400">Cargando gráfico...</p>
            ) : chartData.length === 0 ? (
              <p className="text-slate-400">No hay datos para graficar con estos filtros.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEgr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
                    formatter={(value: any, name: any) => {
                      const label = name === "ingresos" ? "Ingresos" : "Egresos";
                      return [money.format(Number(value)), label];
                    }}
                  />

                  <Area type="monotone" dataKey="ingresos" stroke="#2563eb" fill="url(#colorIng)" fillOpacity={1} />
                  <Area type="monotone" dataKey="egresos" stroke="#ef4444" fill="url(#colorEgr)" fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* ✅ Modal simple (sin librerías extra) */}
        {/* {openCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setOpenCreate(false)} />
            <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Agregar movimiento</h3>
                  <p className="text-sm text-slate-400">Se registrará con el usuario logueado.</p>
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-300">Monto</label>
                    <Input
                      value={montoNuevo}
                      onChange={(e) => setMontoNuevo(e.target.value)}
                      placeholder="Ej: 1200"
                      inputMode="decimal"
                      className="mt-2 bg-slate-900/40 border-slate-800 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">Fecha (opcional)</label>
                    <Input
                      value={fechaNueva}
                      onChange={(e) => setFechaNueva(e.target.value)}
                      type="date"
                      className="mt-2 bg-slate-900/40 border-slate-800 text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => setOpenCreate(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={createMovimiento}
                    disabled={saving || safeNumber(montoNuevo) <= 0}
                  >
                    <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
}