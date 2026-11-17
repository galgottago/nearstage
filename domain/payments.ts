import type { TicketQuote } from "@/domain/types";

/**
 * What a checkout may hand a provider.
 * There is intentionally no card number, CVC, or bank field.
 * A live provider should accept a token minted by its own SDK.
 */
export type PaymentIntent = {
  providerId: string;
  quote: TicketQuote;
  nonce: string;
};

export type PaymentAuthorization =
  | {
      ok: true;
      authorization: {
        providerId: "demo-checkout";
        mode: "demo";
        charged: false;
        reference: string;
      };
    }
  | { ok: false; message: string };

/**
 * Extension point for a real payment provider.
 * V1 ships only DemoPaymentProvider.
 */
export interface PaymentProvider {
  readonly id: string;
  readonly mode: "demo" | "live";
  authorize(intent: PaymentIntent): PaymentAuthorization;
}

export class DemoPaymentProvider implements PaymentProvider {
  readonly id = "demo-checkout";
  readonly mode = "demo" as const;

  authorize(intent: PaymentIntent): PaymentAuthorization {
    if (intent.providerId !== this.id || intent.quote.providerId !== this.id) {
      return {
        ok: false,
        message: "This demo checkout only accepts the demo payment provider.",
      };
    }
    if (intent.quote.charged !== false || intent.quote.mode !== "demo") {
      return {
        ok: false,
        message: "Demo checkout cannot mark an order as charged.",
      };
    }
    return {
      ok: true,
      authorization: {
        providerId: this.id,
        mode: "demo",
        charged: false,
        reference: DemoPaymentProvider.reference(intent.nonce),
      },
    };
  }

  static reference(nonce: string): string {
    const clean = nonce.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    return `DEMO-${clean || "TICKET"}`;
  }
}
