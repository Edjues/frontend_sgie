import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react"; // Importa iconos de Lucide
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const handleSocialLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020617] px-4 selection:bg-blue-500/30">
      <Card className="mx-auto max-w-sm border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bienvenido de nuevo
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa tus credenciales para acceder a tu panel financiero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-600"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-slate-300">
                  Contraseña
                </Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-xs text-blue-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="bg-slate-950 border-slate-800 text-white focus-visible:ring-blue-600"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
              Entrar al Sistema
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f172a] px-2 text-slate-500">
                  O continuar con
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
              onClick={() => handleSocialLogin()}
            >
              <Github className="h-4 w-4" />
              Acceder con GitHub
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-blue-400 font-medium hover:underline">
              Regístrate ahora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
