import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CheckoutScreen } from "@/components/tickets/checkout-screen";
import { SeedCatalog } from "@/domain/seed";

export const metadata: Metadata = { title: "Demo checkout" };

export function generateStaticParams() {
  return SeedCatalog.eventIds().map((id) => ({ eventId: id }));
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading checkout…</p>}>
      <CheckoutRoute params={params} />
    </Suspense>
  );
}

async function CheckoutRoute({ params }: { params: Promise<{ eventId: string }> }) {
  await connection();
  const { eventId } = await params;
  return <CheckoutScreen eventId={eventId} nowIso={new Date().toISOString()} />;
}
