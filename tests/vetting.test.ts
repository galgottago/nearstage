import { describe, expect, it } from "vitest";
import { DemoMetaConnector } from "@/domain/meta";
import { SeedCatalog } from "@/domain/seed";
import {
  OrganizerVetting,
  UnenforcedVettingGate,
  type OrganizerVettingGate,
  type VettingDecision,
  type VettingPacket,
} from "@/domain/vetting";

class RejectingVettingGate implements OrganizerVettingGate {
  readonly revision = "r1" as const;
  readonly enforced = true;

  assess(packet: VettingPacket): VettingDecision {
    const missing = packet.documents["business-license"] === null || packet.documents["tax-id"] === null;
    return {
      enforced: true,
      allowed: !missing,
      status: missing ? "rejected" : "approved",
      reasons: missing ? ["A future gate would reject this packet."] : [],
    };
  }
}

describe("organizer vetting hooks", () => {
  it("is not enforced and does not store license or tax documents", () => {
    expect(OrganizerVetting.ENFORCED).toBe(false);
    const packet = OrganizerVetting.emptyPacket("org-lantern");
    expect(packet.documents["business-license"]).toBeNull();
    expect(packet.documents["tax-id"]).toBeNull();
    expect(packet.screening).toBeNull();

    const decision = OrganizerVetting.evaluate(packet);
    expect(decision.enforced).toBe(false);
    expect(decision.allowed).toBe(true);
    expect(decision.status).toBe("not-enforced");
    expect(new UnenforcedVettingGate().enforced).toBe(false);
  });

  it("leaves every seeded organizer on the unenforced gate with empty document slots", () => {
    for (const organizer of SeedCatalog.organizers()) {
      expect(organizer.vetting.gate).toBe("unenforced");
      expect(organizer.vetting.businessLicense).toBeNull();
      expect(organizer.vetting.taxId).toBeNull();
      expect(organizer.vetting.screening).toBeNull();
    }
  });

  it("accepts a replacement gate without changing the default", () => {
    const packet = OrganizerVetting.emptyPacket("org-future");
    const rejected = OrganizerVetting.evaluate(packet, new RejectingVettingGate());
    expect(rejected.enforced).toBe(true);
    expect(rejected.allowed).toBe(false);
    expect(OrganizerVetting.evaluate(packet).allowed).toBe(true);
  });
});

describe("Meta profile stub", () => {
  it("does not start a live Meta authorization", () => {
    const connector = new DemoMetaConnector();
    const handoff = connector.beginAuthorization("user-casey");
    expect(connector.provider).toBe("meta");
    expect(handoff.mode).toBe("demo-stub");
    expect(handoff.authorizationUrl).toBeNull();
    expect(handoff.message.toLowerCase()).toContain("no request is sent to meta");
  });

  it("links a fictional demo profile and records that no API call was made", () => {
    const link = DemoMetaConnector.link(
      "user-casey",
      "Casey Linden",
      new Date("2026-11-13T12:00:00.000Z"),
    );
    expect(link.mode).toBe("demo-stub");
    expect(link.liveApiCalled).toBe(false);
    expect(link.instagramLabel).toBe("@nearstage.demo");
    expect(link.displayName).toContain("demo");
  });
});
