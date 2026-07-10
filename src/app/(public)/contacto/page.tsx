import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Cómo ponerte en contacto con ${SITE_NAME}.`,
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Contacto</h1>
      <p className="text-muted-foreground">
        ¿Tienes alguna duda sobre el servicio o sobre una reserva? Escríbenos y te
        responderemos lo antes posible.
      </p>
      <a
        href="mailto:bertafloran@gmail.com"
        className="inline-flex items-center gap-2 text-primary underline underline-offset-4"
      >
        <Mail className="size-4" />
        bertafloran@gmail.com
      </a>
    </main>
  );
}
