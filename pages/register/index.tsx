import { useState } from "react";
import { useRouter } from "next/router";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombrecompleto: "",
    email: "",
    confirmEmail: "",
    telefono: "",
    password: "",
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validaciones básicas en el cliente
    if (formData.email !== formData.confirmEmail) {
      setError("Los correos electrónicos no coinciden");
      return;
    }
    if (!formData.terms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombrecompleto: formData.nombrecompleto,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          rolid: 1, // Enviamos el ID del rol (ej: 1 para ADMIN según tu lógica)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      // Registro exitoso -> Redirigir al login
      router.push("/login?registered=true");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="full-name">Nombre Completo</Label>
              <Input 
                id="full-name" 
                required
                value={formData.nombrecompleto}
                onChange={(e) => setFormData({...formData, nombrecompleto: e.target.value})}
                placeholder="Juan Pérez" 
                className="bg-slate-950 border-slate-800" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="m@ejemplo.com" 
                className="bg-slate-950 border-slate-800" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-email">Confirmar Correo</Label>
              <Input 
                id="confirm-email" 
                type="email" 
                required
                value={formData.confirmEmail}
                onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
                className="bg-slate-950 border-slate-800" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                type="tel" 
                required
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="+57 300..." 
                className="bg-slate-950 border-slate-800" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-slate-950 border-slate-800" 
              />
            </div>
            
            <div className="flex items-start space-x-2 py-2">
              <Checkbox 
                id="terms" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({...formData, terms: !!checked})}
                className="border-slate-700 data-[state=checked]:bg-blue-600" 
              />
              <Label htmlFor="terms" className="text-xs text-slate-400 leading-none cursor-pointer">
                Acepto la política de privacidad y el tratamiento de mis datos personales.
              </Label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear cuenta"}
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
