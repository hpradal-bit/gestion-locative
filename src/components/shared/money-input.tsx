import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function MoneyInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="decimal"
        step="0.01"
        min={0}
        className={cn("pr-8", className)}
        {...props}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        €
      </span>
    </div>
  );
}
