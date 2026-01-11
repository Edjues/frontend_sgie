import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020617] px-4">
      <Card className="mx-auto max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription className="text-slate-400">
            Únete a SgiE Finance y toma el control de tus ahorros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nombre Completo</Label>
              <Input id="full-name" placeholder="Juan Pérez" className="bg-slate-950 border-slate-800" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="m@ejemplo.com" className="bg-slate-950 border-slate-800" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-email">Confirmar Correo</Label>
              <Input id="confirm-email" type="email" className="bg-slate-950 border-slate-800" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" placeholder="+57 300..." className="bg-slate-950 border-slate-800" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" className="bg-slate-950 border-slate-800" />
            </div>
            
            <div className="flex items-start space-x-2 py-2">
              <Checkbox id="terms" className="border-slate-700 data-[state=checked]:bg-blue-600" />
              <Label htmlFor="terms" className="text-xs text-slate-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Acepto la política de privacidad y el tratamiento de mis datos personales.
              </Label>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Crear cuenta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
