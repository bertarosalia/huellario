import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/constants";

const LABELS: Record<BookingStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const VARIANTS: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  accepted: "secondary",
  rejected: "destructive",
  cancelled: "destructive",
  completed: "default",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
