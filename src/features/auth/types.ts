import type { Role } from "@/lib/constants";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
};
