"use client";

import Link from "next/link";
import { Format } from "@/domain/format";
import { useDemoSession } from "@/components/session/session-provider";
import { buttonVariants } from "@/components/ui/button";

export function OrdersScreen() {
  const { session } = useDemoSession();
  if (!session) {
    return <p className="p-6 text-sm text-muted-foreground">Loading demo tickets…</p>;
  }
  const orders = session.orders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Demo tickets</p>
      <h1 className="font-heading text-4xl">Orders in this browser</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        These are demo purchases stored locally. None of them charged a card.
      </p>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-card p-6 ring-1 ring-border">
          <p>No demo tickets yet.</p>
          <Link href="/" className={buttonVariants({ className: "mt-4" })}>
            Find an event
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/events/${order.eventId}`} className="font-heading text-2xl hover:underline">
                  {order.eventName}
                </Link>
                <span className="text-sm">{Format.money(order.totalCents)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.id} · {order.quantity} {order.quantity === 1 ? "ticket" : "tickets"} ·{" "}
                {order.buyerName} · {Format.timestamp(order.createdAt)}
              </p>
              <p className="mt-2 text-xs tracking-wide text-[#8a5a12] uppercase">
                Demo purchase · {order.providerId} · not charged
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
