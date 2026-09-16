import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Client Supabase avec la clé service_role — contourne la RLS.
 *
 * Usage strictement limité à la signature électronique publique
 * (`/signer/[token]`) : le signataire n'est jamais authentifié, l'accès à
 * sa demande de signature est donc vérifié par le jeton lui-même (lien
 * magique à forte entropie) plutôt que par une politique RLS. Ne jamais
 * utiliser ce client pour autre chose, et ne jamais l'exposer au client
 * (ce fichier n'est importé que depuis du code serveur).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
