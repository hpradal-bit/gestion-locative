import { createClient } from "@/lib/supabase/server";

export async function getOwnerProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("owner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return data;
}
