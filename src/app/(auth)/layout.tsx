import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Home className="size-4" />
        </div>
        <span className="font-semibold tracking-tight">Gestion locative</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
