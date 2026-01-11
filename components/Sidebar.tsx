import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Button } from "./ui/button";

export function Sidebar() {
  const { data: session } = authClient.useSession();
    let role = (session?.user as any)?.role; // Gracias al plugin del paso 1
    // console.log("Rol del usuario en Sidebar:", session);
  return (
    <div>
        {/* Sidebar Menu */}
        <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col p-6">
            <div className="flex items-center gap-2 font-bold text-xl mb-10 text-blue-500">
                <Wallet className="h-6 w-6" /> SgiE
            </div>
            <nav className="space-y-2 flex-1">
                <Button variant="secondary" className="w-full justify-start gap-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20">
                    <LayoutDashboard size={20} /> Dashboard
                </Button>
                
                {"ADMIN" === "ADMIN" && (
                    <>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
                            <TrendingUp size={20} /> Ingresos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
                            <TrendingDown size={20} /> Egresos
                        </Button>
                    </>
                )}
            </nav>
        </aside>
        {/* <nav>
            <a href="/dashboard">Inicio</a>
            {role === "ADMIN" && (
                <a href="/admin/configuracion">Configuración de Sistema</a>
            )}
        </nav> */}
    </div>
    
  );
}