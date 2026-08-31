import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/features/auth/actions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un bien, un locataire..."
          className="pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="size-4" />
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              2
            </Badge>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-1.5"
              aria-label="Menu du compte"
            >
              <Avatar className="size-7">
                <AvatarFallback>HP</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/parametres">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/parametres/proprietaire">Profil propriétaire</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
              <form action={logout} className="w-full">
                <button type="submit" className="w-full text-left">
                  Se déconnecter
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
