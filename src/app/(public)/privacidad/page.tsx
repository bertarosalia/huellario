import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Cómo ${SITE_NAME} trata los datos personales de clientes y mascotas.`,
  alternates: {
    canonical: "/privacidad",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Política de privacidad</h1>

      <p className="text-muted-foreground">
        En {SITE_NAME} tratamos tus datos personales y los de tu mascota únicamente para
        prestar el servicio de pet sitting a domicilio: gestionar tu cuenta, tus reservas,
        las visitas y los diarios generados tras cada una.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Qué datos tratamos</h2>
        <p className="text-muted-foreground">
          Datos de contacto (nombre, email, teléfono), datos de tus mascotas (nombre,
          especie, información médica y de comportamiento relevante para su cuidado), y el
          historial de reservas, visitas e informes.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Generación de informes con IA</h2>
        <p className="text-muted-foreground">
          Los diarios de visita se generan con ayuda de inteligencia artificial a partir
          únicamente de los datos de la mascota y la visita (nunca de tus datos de
          contacto), y siempre se revisan antes de publicarse.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Tus derechos</h2>
        <p className="text-muted-foreground">
          Puedes solicitar acceso, rectificación o eliminación de tus datos escribiéndonos
          desde la página de{" "}
          <Link href="/contacto" className="text-primary underline underline-offset-4">
            contacto
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
