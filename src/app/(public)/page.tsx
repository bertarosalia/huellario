import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PawPrint, CalendarCheck, FileText, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedReviews } from "@/features/reviews/queries";
import { getSignedPhotoUrls } from "@/lib/supabase/storage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pet sitting a domicilio con diario personalizado de cada visita",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

const STEPS = [
  {
    icon: PawPrint,
    title: "Crea el perfil de tu mascota",
    description:
      "Rutinas, alimentación, medicación, miedos y necesidades especiales: todo lo que la cuidadora necesita saber.",
  },
  {
    icon: CalendarCheck,
    title: "Solicita una reserva",
    description: "Elige el servicio, la fecha y la hora. Recibirás confirmación cuando se acepte.",
  },
  {
    icon: FileText,
    title: "Recibe el diario de la visita",
    description:
      "Tras cada visita, recibe un diario personalizado de tu cuidadora, siempre revisado antes de enviártelo.",
  },
];

const SERVICES = [
  { name: "Visita a domicilio", duration: "30 min", description: "Alimentar, revisar agua, limpiar la zona y acompañar a la mascota." },
  { name: "Paseo", duration: "45 min", description: "Paseo individual adaptado al ritmo y necesidades de la mascota." },
  { name: "Cuidado prolongado", duration: "120 min", description: "Acompañamiento más largo en el domicilio." },
  { name: "Cuidado con medicación", duration: "30 min", description: "Visita que incluye administración de medicación indicada por el propietario." },
];

const TRUST_MARKERS = [
  { icon: HeartHandshake, label: "Cuidado personalizado" },
  { icon: Sparkles, label: "Diario personalizado, revisado siempre por tu cuidadora" },
  { icon: ShieldCheck, label: "Tus datos, protegidos" },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Pet sitting a domicilio",
  provider: {
    "@type": "Person",
    name: "Huellario",
  },
  areaServed: "ES",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de pet sitting",
    itemListElement: SERVICES.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
      },
    })),
  },
};

export default async function Home() {
  const reviews = await getPublishedReviews();
  const photoPaths = reviews
    .map((review) => review.pet_photo_path)
    .filter((path): path is string => Boolean(path));
  const photoUrls = await getSignedPhotoUrls(photoPaths);
  const photoUrlByPath = new Map(photoPaths.map((path, index) => [path, photoUrls[index]]));

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          Cuidado cercano para tu mascota, con un diario de cada visita.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Gestiona reservas de pet sitting a domicilio y recibe un diario
          personalizado de cada visita, revisado y compartido contigo por tu
          cuidadora.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/register" />}>
            Registrarme
          </Button>
          <Button size="lg" variant="secondary" render={<Link href="#servicios" />}>
            Ver servicios
          </Button>
        </div>
      </section>

      <section className="border-y bg-muted/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6 px-4">
          {TRUST_MARKERS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-5 text-secondary-foreground" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold">Cómo funciona</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h3 className="font-semibold">
                {i + 1}. {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios" className="bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold">Servicios</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <Card key={service.name}>
                <CardContent className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {service.duration}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold">Reseñas verificadas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => {
              const photoUrl = review.pet_photo_path
                ? photoUrlByPath.get(review.pet_photo_path)
                : null;

              return (
                <Card key={review.id}>
                  <CardContent className="flex gap-4">
                    {photoUrl && (
                      <Image
                        src={photoUrl}
                        alt="Foto de la mascota"
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-primary">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">Cliente verificado</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
