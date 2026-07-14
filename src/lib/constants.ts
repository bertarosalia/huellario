export const SITE_NAME = "Huellario";
export const SITE_DESCRIPTION =
  "Gestión de servicios de pet sitting a domicilio, con un diario personalizado de cada visita, revisado siempre por tu cuidadora antes de enviártelo.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const ROLES = ["client", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const REPORT_STATUSES = ["draft", "published"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REVIEW_STATUSES = ["pending", "published", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const BOOKING_RESPONSE_SLA_DAYS = 2;
