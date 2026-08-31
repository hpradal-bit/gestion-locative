import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Client Components.
 * Ne jamais importer ce fichier dans du code serveur : il n'utilise que la clé anonyme.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
