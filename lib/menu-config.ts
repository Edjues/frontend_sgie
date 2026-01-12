import { LayoutDashboard, TrendingUp, UserCog, Notebook } from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Sistema de gestión I&E",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "USER"],
  },
  // {
  //   title: "Sistema de gestión I&E",
  //   href: "/gestionI&E",
  //   icon: TrendingUp,
  //   roles: ["ADMIN", "USER"],
  // },
  {
    title: "Gestión de usuarios",
    href: "/usuario",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    title: "Reporte",
    href: "/reporte",
    icon: Notebook,
    roles: ["ADMIN"],
  },
];