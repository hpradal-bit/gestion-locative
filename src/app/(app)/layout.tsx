import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ensureUpcomingRentSchedules } from "@/features/rent-schedules/ensure-schedules";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Pas de tâche planifiée dans cette app : on comble ici les échéances de
  // loyer manquantes à chaque visite (voir ensure-schedules.ts).
  await ensureUpcomingRentSchedules();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar userEmail={user?.email ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
