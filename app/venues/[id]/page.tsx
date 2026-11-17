import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { VenueScreen } from "@/components/venues/venue-screen";
import { SeedCatalog } from "@/domain/seed";

export function generateStaticParams() {
  return SeedCatalog.venueIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: id.replace(/^venue-/, "").replaceAll("-", " ") };
}

export default function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading the venue…</p>}>
      <VenueRoute params={params} />
    </Suspense>
  );
}

async function VenueRoute({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  return <VenueScreen venueId={id} nowIso={new Date().toISOString()} />;
}
