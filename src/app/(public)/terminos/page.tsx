import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: `Condiciones de uso del servicio de pet sitting a domicilio de ${SITE_NAME}.`,
  alternates: {
    canonical: "/terminos",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Términos de servicio</h1>

      <p className="text-muted-foreground">
        Al registrarte y usar {SITE_NAME} aceptas estas condiciones, que regulan la
        solicitud y gestión de reservas de pet sitting a domicilio a través de la
        plataforma.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Reservas</h2>
        <p className="text-muted-foreground">
          Toda solicitud de reserva queda pendiente de confirmación por parte de la
          administradora. El estado de cada reserva (pendiente, aceptada, rechazada,
          completada o cancelada) es visible en tu área de cliente.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Diarios de visita</h2>
        <p className="text-muted-foreground">
          El diario generado tras cada visita se revisa siempre por la administradora
          antes de publicarse, y no sustituye una valoración veterinaria profesional.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Responsabilidad</h2>
        <p className="text-muted-foreground">
          La información sobre tu mascota (salud, comportamiento, necesidades especiales)
          debe ser veraz y estar actualizada, ya que de ella depende el cuidado prestado
          durante cada visita.
        </p>
      </section>
    </main>
  );
}
