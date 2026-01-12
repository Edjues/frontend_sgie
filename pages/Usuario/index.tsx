"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Pencil, ArrowUpDown, X, Save } from "lucide-react";


type Usuario = {
  id: number;
  rolid: 1 | 2;
  nombrecompleto: string;
  email: string;
  telefono: string | null;
  estado: boolean;
  createdAt: string;
  createdAtT: string;
};

type SortKey =
  | "id"
  | "nombrecompleto"
  | "email"
  | "telefono"
  | "rolid"
  | "estado"
  | "createdAt";
type SortDir = "asc" | "desc";

const ROLE_LABEL: Record<number, string> = {
  1: "ADMIN",
  2: "USER",
};

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

  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);

  return Number(a) - Number(b);
}

export default function usuario() {
  const { data: session } = authClient.useSession();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editRol, setEditRol] = useState<1 | 2>(2);
  const [saving, setSaving] = useState(false);

  async function loadUsuarios() {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);

      const res = await fetch("/api/usuario", { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as Usuario[];
      setUsuarios(data);
    } catch (e: any) {
      setErrorUsers(e?.message ?? "Error cargando usuarios");
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

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
      ? usuarios.filter((u) => {
          const name = (u.nombrecompleto ?? "").toLowerCase();
          const email = (u.email ?? "").toLowerCase();
          return name.includes(q) || email.includes(q);
        })
      : usuarios;

    return [...filtered].sort((x, y) => {
      const c = compare((x as any)[sortKey], (y as any)[sortKey]);
      return sortDir === "asc" ? c : -c;
    });
  }, [usuarios, query, sortKey, sortDir]);

  function startEdit(u: Usuario) {
    setEditingId(u.id);
    setEditNombre(u.nombrecompleto ?? "");
    setEditRol(u.rolid ?? 2);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditNombre("");
    setEditRol(2);
  }

  async function saveEdit() {
    if (editingId == null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/usuario/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombrecompleto: editNombre.trim(),
          rolid: editRol,
        }),
      });

      if (!res.ok) throw new Error(`Error guardando (HTTP ${res.status})`);

      await loadUsuarios();
      cancelEdit();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  

  return (
    // ✅ De row fijo -> columna en móvil y fila en md+
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row">
      {/* ✅ Sidebar no “empuja” en móvil; si tu Sidebar es ancho fijo, esto ayuda */}
      <div className="md:sticky md:top-0 md:h-screen md:w-[280px]">
        <Sidebar userRole={(session?.user as any)?.role ?? "USER"} />
        
      </div>

      {/* ✅ Menos padding en móvil */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {/* ✅ Header apilado en móvil */}
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Gestión de usuarios</h2>
            <p className="text-slate-400 text-sm">{filteredAndSorted.length} usuario(s)</p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-slate-700"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session?.user?.image ?? undefined} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-slate-900 border-slate-800 text-slate-100"
                align="end"
              >
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
          {/* ✅ Controles apilados en móvil */}
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-slate-200">Usuarios</CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="bg-slate-950/40 border-slate-800 text-slate-100 w-full sm:w-[320px]"
              />
              <Button
                variant="secondary"
                className="bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 w-full sm:w-auto"
                onClick={loadUsuarios}
              >
                Actualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loadingUsers && <p className="text-slate-400">Cargando usuarios...</p>}
            {errorUsers && <p className="text-red-400">{errorUsers}</p>}

            {!loadingUsers && !errorUsers && (
              // ✅ Scroll horizontal y “borde” suave para indicar overflow
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <div className="min-w-[760px] px-4 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-800">
                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button
                            className="inline-flex items-center gap-2 hover:text-slate-200"
                            onClick={() => toggleSort("id")}
                          >
                            ID <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button
                            className="inline-flex items-center gap-2 hover:text-slate-200"
                            onClick={() => toggleSort("nombrecompleto")}
                          >
                            Nombre <ArrowUpDown size={14} />
                          </button>
                        </th>

                        {/* ✅ Oculta Email en pantallas muy chicas (y aun así queda accesible en scroll) */}
                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button
                            className="inline-flex items-center gap-2 hover:text-slate-200"
                            onClick={() => toggleSort("email")}
                          >
                            Email <ArrowUpDown size={14} />
                          </button>
                        </th>

                        {/* ✅ Teléfono: opcional ocultarlo en móvil si quieres: hidden md:table-cell */}
                        <th className="py-3 pr-4 whitespace-nowrap hidden lg:table-cell">
                          <button
                            className="inline-flex items-center gap-2 hover:text-slate-200"
                            onClick={() => toggleSort("telefono")}
                          >
                            Teléfono <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">
                          <button
                            className="inline-flex items-center gap-2 hover:text-slate-200"
                            onClick={() => toggleSort("rolid")}
                          >
                            Rol <ArrowUpDown size={14} />
                          </button>
                        </th>

                        <th className="py-3 pr-4 whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAndSorted.map((u) => {
                        const isEditing = editingId === u.id;

                        return (
                          <tr
                            key={u.id}
                            className="border-b border-slate-800/60 text-slate-200"
                          >
                            <td className="py-3 pr-4 whitespace-nowrap">{u.id}</td>

                            <td className="py-3 pr-4 min-w-[220px]">
                              {isEditing ? (
                                <Input
                                  value={editNombre}
                                  onChange={(e) => setEditNombre(e.target.value)}
                                  className="bg-slate-950/40 border-slate-800 text-slate-100"
                                />
                              ) : (
                                <span className="block truncate max-w-[320px]">
                                  {u.nombrecompleto}
                                </span>
                              )}
                            </td>

                            <td className="py-3 pr-4">
                              <span className="block truncate max-w-[320px]">
                                {u.email}
                              </span>
                            </td>

                            <td className="py-3 pr-4 hidden lg:table-cell">
                              {u.telefono}
                            </td>

                            <td className="py-3 pr-4 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={editRol}
                                  onChange={(e) =>
                                    setEditRol(Number(e.target.value) as 1 | 2)
                                  }
                                  className="h-10 rounded-md bg-slate-950/40 border border-slate-800 px-3 text-slate-100"
                                >
                                  <option value={1}>ADMIN</option>
                                  <option value={2}>USER</option>
                                </select>
                              ) : (
                                <span className="px-2 py-1 rounded-md bg-slate-800/60">
                                  {ROLE_LABEL[u.rolid] ?? `ROL ${u.rolid}`}
                                </span>
                              )}
                            </td>

                            <td className="py-3 pr-4 whitespace-nowrap">
                              {isEditing ? (
                                // ✅ Botones apilados en pantallas pequeñas
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    className="gap-2 w-full sm:w-auto"
                                    onClick={saveEdit}
                                    disabled={saving || !editNombre.trim()}
                                  >
                                    <Save size={14} />{" "}
                                    {saving ? "Guardando..." : "Guardar"}
                                  </Button>

                                  <Button
                                    variant="secondary"
                                    className="gap-2 w-full sm:w-auto"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                  >
                                    <X size={14} /> Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="secondary"
                                  className="bg-red-400/60 hover:bg-red-400 text-white gap-2"
                                  onClick={() => startEdit(u)}
                                >
                                  <Pencil size={14} /> Editar
                                </Button>
                              )}
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
      </main>
    </div>
  );
}
