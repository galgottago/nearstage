import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { EventScreen } from "@/components/events/event-screen";
import { SeedCatalog } from "@/domain/seed";

export function generateStaticParams() {
  return SeedCatalog.eventIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: id.replace(/^evt-/, "").replaceAll("-", " ") };
}

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading the event…</p>}>
      <EventRoute params={params} />
    </Suspense>
  );
}

async function EventRoute({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  return <EventScreen eventId={id} nowIso={new Date().toISOString()} />;
}
