import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Receipt,
  Hammer,
  Landmark,
  TrendingUp,
  Calculator,
  FolderOpen,
  Bell,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Affiché aussi dans la barre de navigation mobile (nombre limité de places). */
  mobile?: boolean;
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, mobile: true },
  { title: "Mes biens", href: "/biens", icon: Building2, mobile: true },
  { title: "Locataires", href: "/locataires", icon: Users, mobile: true },
  { title: "Loyers", href: "/loyers", icon: Wallet, mobile: true },
  { title: "Dépenses", href: "/depenses", icon: Receipt },
  { title: "Travaux", href: "/travaux", icon: Hammer },
  { title: "Financements", href: "/financements", icon: Landmark },
  { title: "Rentabilité", href: "/rentabilite", icon: TrendingUp },
  { title: "Simulateur", href: "/simulateur", icon: Calculator },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Paramètres", href: "/parametres", icon: Settings },
];
