import { DemoPaymentProvider, type PaymentProvider } from "@/domain/payments";
import type { DemoOrder, TicketQuote, TicketableEvent } from "@/domain/types";

export type TicketQuoteResult =
  | { ok: true; quote: TicketQuote }
  | { ok: false; message: string };

export type PurchaseResult =
  | { ok: true; order: DemoOrder }
  | { ok: false; message: string };

export type CheckoutRequest = {
  event: TicketableEvent;
  quantity: number;
  buyerName: string;
  nonce: string;
  now?: Date;
  provider?: PaymentProvider;
};

/**
 * Narrow store surface so checkout can be tested without the browser.
 * DemoSession implements it.
 */
export interface DemoSessionLike {
  soldCount(eventId: string): number;
  placeOrder(order: DemoOrder): void;
}

export class TicketCheckout {
  static readonly MAX_PER_ORDER = 6;

  static remaining(event: Pick<TicketableEvent, "capacity" | "ticketsSold">): number {
    return Math.max(0, event.capacity - event.ticketsSold);
  }

  static quote(event: TicketableEvent, quantity: number): TicketQuoteResult {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, message: "Choose at least one ticket." };
    }
    if (quantity > this.MAX_PER_ORDER) {
      return {
        ok: false,
        message: `Demo orders are limited to ${this.MAX_PER_ORDER} tickets.`,
      };
    }
    const remaining = this.remaining(event);
    if (quantity > remaining) {
      return {
        ok: false,
        message:
          remaining <= 0
            ? "This event is sold out."
            : `Only ${remaining} ${remaining === 1 ? "ticket remains" : "tickets remain"}.`,
      };
    }
    const subtotalCents = event.priceCents * quantity;
    return {
      ok: true,
      quote: {
        eventId: event.id,
        eventName: event.name,
        quantity,
        unitPriceCents: event.priceCents,
        subtotalCents,
        providerFeeCents: 0,
        totalCents: subtotalCents,
        providerId: "demo-checkout",
        mode: "demo",
        charged: false,
      },
    };
  }
}

export class TicketPurchase {
  static complete(input: CheckoutRequest): PurchaseResult {
    const buyerName = input.buyerName.trim();
    if (buyerName.length < 2) {
      return { ok: false, message: "Add the name to print on the demo ticket." };
    }
    const quoted = TicketCheckout.quote(input.event, input.quantity);
    if (!quoted.ok) {
      return quoted;
    }
    const provider = input.provider ?? new DemoPaymentProvider();
    const authorization = provider.authorize({
      providerId: provider.id,
      quote: quoted.quote,
      nonce: input.nonce,
    });
    if (!authorization.ok) {
      return authorization;
    }
    if (authorization.authorization.charged !== false) {
      return { ok: false, message: "Demo checkout refused a charge." };
    }
    const createdAt = (input.now ?? new Date()).toISOString();
    return {
      ok: true,
      order: {
        id: authorization.authorization.reference,
        eventId: quoted.quote.eventId,
        eventName: quoted.quote.eventName,
        quantity: quoted.quote.quantity,
        unitPriceCents: quoted.quote.unitPriceCents,
        totalCents: quoted.quote.totalCents,
        buyerName,
        providerId: "demo-checkout",
        mode: "demo",
        charged: false,
        reference: authorization.authorization.reference,
        createdAt,
      },
    };
  }
}

export class DemoCheckout {
  /**
   * Applies session holds on top of catalog sales, then records a demo order.
   * No payment provider other than the injected one is contacted.
   */
  static place(session: DemoSessionLike, input: CheckoutRequest): PurchaseResult {
    const event: TicketableEvent = {
      ...input.event,
      ticketsSold: input.event.ticketsSold + session.soldCount(input.event.id),
    };
    const result = TicketPurchase.complete({ ...input, event });
    if (result.ok) {
      session.placeOrder(result.order);
    }
    return result;
  }
}
