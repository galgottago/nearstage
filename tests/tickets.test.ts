import { describe, expect, it } from "vitest";
import { DemoPaymentProvider } from "@/domain/payments";
import { DemoSession } from "@/domain/session";
import { DemoCheckout, TicketCheckout, TicketPurchase } from "@/domain/tickets";
import type { TicketableEvent } from "@/domain/types";

const event: TicketableEvent = {
  id: "evt-lantern",
  name: "Lantern Market Night",
  priceCents: 1200,
  capacity: 10,
  ticketsSold: 8,
};

describe("demo ticket checkout", () => {
  it("quotes a demo total with no provider fee and no charge", () => {
    const quoted = TicketCheckout.quote(event, 2);
    expect(quoted.ok).toBe(true);
    if (quoted.ok) {
      expect(quoted.quote.totalCents).toBe(2400);
      expect(quoted.quote.providerFeeCents).toBe(0);
      expect(quoted.quote.mode).toBe("demo");
      expect(quoted.quote.charged).toBe(false);
      expect(quoted.quote.providerId).toBe("demo-checkout");
    }
  });

  it("rejects an empty order, an oversized order, and a sold-out request", () => {
    expect(TicketCheckout.quote(event, 0).ok).toBe(false);
    expect(TicketCheckout.quote(event, TicketCheckout.MAX_PER_ORDER + 1).ok).toBe(false);
    expect(TicketCheckout.quote(event, 3).ok).toBe(false);
  });

  it("completes a demo purchase without charging", () => {
    const result = TicketPurchase.complete({
      event,
      quantity: 2,
      buyerName: "Casey Linden",
      nonce: "abc123",
      now: new Date("2026-11-13T20:00:00.000Z"),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.id).toBe("DEMO-ABC123");
      expect(result.order.charged).toBe(false);
      expect(result.order.mode).toBe("demo");
      expect(result.order.providerId).toBe("demo-checkout");
      expect(result.order.totalCents).toBe(2400);
      expect(result.order.buyerName).toBe("Casey Linden");
    }
  });

  it("refuses a blank ticket name", () => {
    const result = TicketPurchase.complete({
      event,
      quantity: 1,
      buyerName: " ",
      nonce: "name",
    });
    expect(result.ok).toBe(false);
  });

  it("holds inventory across demo orders in the session", () => {
    const session = DemoSession.memory();
    const first = DemoCheckout.place(session, {
      event,
      quantity: 2,
      buyerName: "Casey Linden",
      nonce: "hold1",
    });
    expect(first.ok).toBe(true);
    expect(session.soldCount(event.id)).toBe(2);
    const second = DemoCheckout.place(session, {
      event,
      quantity: 1,
      buyerName: "Casey Linden",
      nonce: "hold2",
    });
    expect(second.ok).toBe(false);
    expect(session.orders()).toHaveLength(1);
  });

  it("authorizes only through the demo provider and never marks a charge", () => {
    const provider = new DemoPaymentProvider();
    const quoted = TicketCheckout.quote({ ...event, ticketsSold: 0 }, 1);
    expect(quoted.ok).toBe(true);
    if (!quoted.ok) {
      return;
    }
    const authorization = provider.authorize({
      providerId: provider.id,
      quote: quoted.quote,
      nonce: "provider",
    });
    expect(authorization.ok).toBe(true);
    if (authorization.ok) {
      expect(authorization.authorization.charged).toBe(false);
      expect(authorization.authorization.mode).toBe("demo");
    }
    expect(provider.mode).toBe("demo");
  });
});
