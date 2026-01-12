import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Wallet, Settings, LogOut, TrendingUp, TrendingDown, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      {/* Sidebar Menu */}
      
      {/* <Sidebar /> */}
      <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2 font-bold text-xl mb-10 text-blue-500">
          <Wallet className="h-6 w-6" /> SgiE
        </div>
        <nav className="space-y-2 flex-1">
          <Button variant="secondary" className="w-full justify-start gap-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20">
            <LayoutDashboard size={20} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
            <TrendingUp size={20} /> Sistema de gestión I&E 
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
            <TrendingUp size={20} />  Gestión de usuarios
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
            <TrendingDown size={20} /> Reporte
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Resumen Financiero</h2>
          
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
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-800">
                <Settings size={16} /> Configuración
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 cursor-pointer text-red-400 hover:bg-red-500/10"
                onClick={() => authClient.signOut()}
              >
                <LogOut size={16} /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Balance Total</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">$45,231.89</div>
              <p className="text-xs text-emerald-500">+20.1% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Ingresos del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">+$12,400.00</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Egresos del Mes</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">-$4,320.50</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400">Comparativa Ingresos vs Egresos</CardTitle>
          </CardHeader>
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#2563eb" fillOpacity={1} fill="url(#colorIng)" />
                <Area type="monotone" dataKey="egresos" stroke="#ef4444" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  );
}
