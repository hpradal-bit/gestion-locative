"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const primary = navItems.filter((item) => item.mobile);
  const rest = navItems.filter((item) => !item.mobile);

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <ul className="grid grid-cols-5">
        {primary.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground",
                  active && "text-primary"
                )}
              >
                <item.icon className="size-5" />
                {item.title}
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex w-full flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground">
                <Menu className="size-5" />
                Plus
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <SheetHeader>
                <SheetTitle>Plus</SheetTitle>
              </SheetHeader>
              <ul className="grid grid-cols-3 gap-2 p-4 pt-0">
                {rest.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium hover:bg-accent"
                    >
                      <item.icon className="size-5" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
