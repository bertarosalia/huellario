import "server-only";
import { createClient } from "@supabase/supabase-js";

// Único uso permitido de la service role key: resolver el email de un
// usuario a partir de su id (auth.users.email no está duplicado en
// profiles). No usar este cliente para nada más.
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await adminClient.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}
