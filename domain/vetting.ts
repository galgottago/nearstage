import type { VettingDocumentKind } from "@/domain/types";

/**
 * Revision-one extension point.
 *
 * A future gate can require a business-license reference, a tax-id reference,
 * and an AI screening result before an organizer may publish. V1 does not
 * collect or store those documents, and OrganizerVetting.ENFORCED stays false.
 *
 * Swap the object returned by OrganizerVetting.createGate(), or pass a gate
 * into OrganizerVetting.evaluate(), without rewriting checkout or the catalog.
 */

export type VettingDocumentSlot = {
  kind: VettingDocumentKind;
  /** Opaque reference only. Never a raw license number or tax identifier. */
  reference: string | null;
};

export type VettingPacket = {
  organizerId: string;
  documents: Record<VettingDocumentKind, VettingDocumentSlot | null>;
  /** Reserved for a later screening step. Unused in v1. */
  screening: null | {
    provider: string;
    status: "pending" | "clear" | "review";
  };
};

export type VettingDecision = {
  enforced: boolean;
  allowed: boolean;
  status: "not-enforced" | "approved" | "rejected";
  reasons: string[];
};

export interface OrganizerVettingGate {
  readonly revision: "r1";
  readonly enforced: boolean;
  assess(packet: VettingPacket): VettingDecision;
}

export class UnenforcedVettingGate implements OrganizerVettingGate {
  readonly revision = "r1" as const;
  readonly enforced = false;

  assess(packet: VettingPacket): VettingDecision {
    return {
      enforced: false,
      allowed: true,
      status: "not-enforced",
      reasons: [
        `Organizer ${packet.organizerId} is not blocked. Business-license, tax-id, and AI screening are not active in this demo.`,
      ],
    };
  }
}

export class OrganizerVetting {
  /** Keep false until a real gate replaces UnenforcedVettingGate. */
  static readonly ENFORCED = false;

  static createGate(): OrganizerVettingGate {
    return new UnenforcedVettingGate();
  }

  static emptyPacket(organizerId: string): VettingPacket {
    return {
      organizerId,
      documents: {
        "business-license": null,
        "tax-id": null,
      },
      screening: null,
    };
  }

  static evaluate(
    packet: VettingPacket,
    gate: OrganizerVettingGate = this.createGate(),
  ): VettingDecision {
    return gate.assess(packet);
  }
}
