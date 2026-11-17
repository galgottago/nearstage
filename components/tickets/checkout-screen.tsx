"use client";

import { useState } from "react";
import Link from "next/link";
import { Catalog, CatalogView } from "@/domain/catalog";
import { Format } from "@/domain/format";
import { DemoPaymentProvider } from "@/domain/payments";
import { SeedCatalog } from "@/domain/seed";
import { DemoCheckout, TicketCheckout } from "@/domain/tickets";
import type { DemoOrder } from "@/domain/types";
import { useDemoSession } from "@/components/session/session-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckoutScreen({
  eventId,
  nowIso,
}: {
  eventId: string;
  nowIso: string;
}) {
  const { session } = useDemoSession();
  const now = new Date(nowIso);
  const user = SeedCatalog.currentUser();
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState(user.displayName);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<DemoOrder | null>(null);

  const view = CatalogView.listing(eventId, now, session);

  if (!view) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="font-heading text-3xl">That event is not in the demo.</h1>
        <Link href="/" className={buttonVariants({ className: "mt-4" })}>
          Back to the map
        </Link>
      </div>
    );
  }

  const quoted = TicketCheckout.quote(
    {
      id: view.id,
      name: view.name,
      priceCents: view.priceCents,
      capacity: view.capacity,
      ticketsSold: view.ticketsSold,
    },
    quantity,
  );
  const remaining = TicketCheckout.remaining(view);

  function placeOrder() {
    const base = Catalog.listing(eventId, now);
    if (!base || !session) {
      setError(session ? "The catalog could not be read." : "The demo store is still opening in this browser.");
      return;
    }
    const result = DemoCheckout.place(session, {
      event: {
        id: base.id,
        name: base.name,
        priceCents: base.priceCents,
        capacity: base.capacity,
        ticketsSold: base.ticketsSold,
      },
      quantity,
      buyerName,
      nonce: crypto.randomUUID(),
      provider: new DemoPaymentProvider(),
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setOrder(result.order);
  }

  if (order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <p className="text-xs tracking-[0.16em] text-[#8a5a12] uppercase">Demo purchase</p>
        <h1 className="mt-2 font-heading text-4xl">Ticket held. Nothing was charged.</h1>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Order</dt>
            <dd className="font-medium">{order.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Event</dt>
            <dd>{order.eventName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Name on ticket</dt>
            <dd>{order.buyerName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Quantity</dt>
            <dd>{order.quantity}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total</dt>
            <dd>{Format.money(order.totalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Provider</dt>
            <dd>{order.providerId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Charged</dt>
            <dd>No</dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-3">
          <Link href="/orders" className={buttonVariants()}>
            View demo tickets
          </Link>
          <Link href={`/events/${order.eventId}`} className={buttonVariants({ variant: "outline" })}>
            Back to the event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <div className="rounded-2xl bg-[#f4e2b0] px-4 py-3 text-sm text-[#3d2c10]">
        Demo purchase. Nearstage will not collect a card number and will not charge anyone.
        The provider in this build is <span className="font-medium">demo-checkout</span>.
      </div>
      <div>
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Checkout</p>
        <h1 className="font-heading text-4xl">{view.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {view.venueName} · {Format.when(view.startsAt, view.endsAt)} · {remaining} left
        </p>
      </div>
      <form
        className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          placeOrder();
        }}
      >
        <div>
          <Label htmlFor="qty">Tickets</Label>
          <div className="mt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              Fewer
            </Button>
            <span className="w-8 text-center text-lg">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setQuantity((current) => Math.min(TicketCheckout.MAX_PER_ORDER, current + 1))
              }
            >
              More
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="buyer">Name on the demo ticket</Label>
          <Input
            id="buyer"
            value={buyerName}
            onChange={(event) => setBuyerName(event.target.value)}
            className="mt-1 h-10"
            autoComplete="off"
          />
        </div>
        <dl className="space-y-1 text-sm">
          {quoted.ok ? (
            <>
              <div className="flex justify-between">
                <dt>
                  {quoted.quote.quantity} × {Format.money(quoted.quote.unitPriceCents)}
                </dt>
                <dd>{Format.money(quoted.quote.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Provider fee</dt>
                <dd>{Format.money(quoted.quote.providerFeeCents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Demo total</dt>
                <dd>{Format.money(quoted.quote.totalCents)}</dd>
              </div>
            </>
          ) : (
            <p>{quoted.message}</p>
          )}
        </dl>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={!session || !quoted.ok}>
          Place demo order
        </Button>
      </form>
      <aside className="rounded-2xl border border-dashed border-[#1f4d3a]/40 p-4 text-sm">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Extension point</p>
        <p className="mt-2">
          PaymentProvider is the seam for a later processor. DemoPaymentProvider authorizes this
          order with charged set to false. A live provider should take a token from its own
          checkout, not a card number typed into Nearstage.
        </p>
      </aside>
    </div>
  );
}
