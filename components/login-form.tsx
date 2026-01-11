import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client" // Tu cliente de Better Auth

export function LoginForm() {
  const handleSocialLogin = async (provider: "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    })
  }

  return (
    <Card className="mx-auto max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu correo abajo para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="m@ejemplo.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-400 px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full bg-white" 
            onClick={() => handleSocialLogin("github")}
          >
            {/* Puedes usar un icono de Lucide-react aquí */}
            Acceder con GitHub
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="underline">
            Regístrate
          </Link>
        </div>
        <Link href="#" className="ml-auto inline-block text-sm underline">
            ¿Olvidaste tu contraseña?
        </Link>
      </CardContent>
    </Card>
  )
}
