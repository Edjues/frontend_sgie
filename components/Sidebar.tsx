import Link from "next/link";
import { useRouter } from "next/router";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "@/lib/menu-config";

interface SidebarProps {
  userRole?: string | null;
}

export function Sidebar({ userRole }: SidebarProps) {
  const router = useRouter();



  return (
    <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col p-6 h-screen sticky top-0 bg-slate-950">
      <div className="flex items-center gap-2 font-bold text-xl mb-10 text-blue-500">
        <Wallet className="h-6 w-6" /> SgiE
      </div>
      
      <nav className="space-y-2 flex-1">
        {MENU_ITEMS.map((item) => {
          // Lógica de Validación de Rol
          if (!userRole || !item.roles.includes(userRole)) return null;

          const isActive = router.pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              asChild
              className={cn(
                "w-full justify-start gap-3 transition-colors",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Link href={item.href}>
                <item.icon size={20} />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}