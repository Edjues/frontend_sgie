import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Wallet, LogOut, TrendingUp, TrendingDown } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";


// import { Sidebar } from "@/components/Sidebar";

const data = [
  { name: "Ene", ingresos: 4000, egresos: 2400 },
  { name: "Feb", ingresos: 3000, egresos: 1398 },
  { name: "Mar", ingresos: 2000, egresos: 9800 },
  { name: "Abr", ingresos: 2780, egresos: 3908 },
  { name: "May", ingresos: 1890, egresos: 4800 },
  { name: "Jun", ingresos: 2390, egresos: 3800 },
];



export default function Dashboard() {
  const { data: session } = authClient.useSession();
  // const session = await auth.api.getSession({ headers: ctx.req.headers });


  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      {/* Sidebar Menu */}
      
      {/* <Sidebar /> */}
     <Sidebar userRole={'ADMIN'} />


      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Pagina De Prueba</h2>
          
          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-700">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
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
        </header>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          
        </div>
      </main>
    </div>
  );
}
