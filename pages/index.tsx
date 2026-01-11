import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    // Usamos 'bg-slate-950' en lugar de negro puro para una base más elegante
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      
      {/* --- NAVEGACIÓN --- */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SgiE <span className="font-light">Finance</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="container mx-auto px-6 pt-24 pb-20 text-center">
        <Badge variant="outline" className="mb-6 border-blue-500/30 bg-blue-500/10 text-blue-400 px-4 py-1">
          <ShieldCheck className="w-3 h-3 mr-2" /> Seguridad Bancaria 2026
        </Badge>
        
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl leading-tight">
          Tu dinero, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            bajo tu control total
          </span>
        </h1>
        
        <p className="mx-auto mb-12 max-w-[650px] text-lg text-slate-400 leading-relaxed">
          SgiE Finance es la plataforma inteligente para gestionar transacciones sin fricciones. 
          Optimiza tus flujos de caja con analítica avanzada en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-10 text-md group">
              Empezar ahora 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="h-14 px-10 border-slate-700 hover:bg-slate-800 text-slate-300">
              Ver Demo
            </Button>
          </Link>
        </div>

        {/* --- CARDS CON EFECTO GLASSMORFISMO --- */}
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maximiza Ingresos</h3>
              <p className="text-slate-400 leading-relaxed">
                Identifica tendencias de crecimiento y asegura que cada centavo trabaje para ti.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:border-red-500/50 transition-colors">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400">
                <TrendingDown className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reduce Egresos</h3>
              <p className="text-slate-400 leading-relaxed">
                Algoritmos que detectan gastos hormiga y suscripciones olvidadas automáticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:border-slate-500/50 transition-colors">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <Wallet className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bóveda Digital</h3>
              <p className="text-slate-400 leading-relaxed">
                Tus datos financieros protegidos con encriptación de grado militar en la nube.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-900 py-12 text-center">
        <div className="container mx-auto px-6">
            <p className="text-slate-500 text-sm">
                © 2026 SgiE Finance. Construido con Next.js 16 y Better Auth.
            </p>
        </div>
      </footer>
    </div>
  );
}
