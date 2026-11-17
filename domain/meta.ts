import type { MetaAuthorizationHandoff, MetaProfileLink } from "@/domain/types";

/**
 * Extension point for a real Meta (Facebook/Instagram) OAuth connection.
 * DemoMetaConnector must not call Meta, mint a token, or store a real profile.
 * A later adapter can return an authorizationUrl and complete the code exchange
 * behind this same interface.
 */
export interface MetaOAuthAdapter {
  readonly provider: "meta";
  beginAuthorization(userId: string): MetaAuthorizationHandoff;
}

export class DemoMetaConnector implements MetaOAuthAdapter {
  readonly provider = "meta" as const;

  beginAuthorization(userId: string): MetaAuthorizationHandoff {
    return {
      provider: "meta",
      mode: "demo-stub",
      authorizationUrl: null,
      message: `Demo stub for ${userId}. No request is sent to Meta, and no token is created.`,
    };
  }

  static link(userId: string, displayName: string, now = new Date()): MetaProfileLink {
    return {
      provider: "meta",
      mode: "demo-stub",
      userId,
      displayName: `${displayName} (demo)`,
      facebookLabel: "facebook.com/nearstage.demo.profile",
      instagramLabel: "@nearstage.demo",
      connectedAt: now.toISOString(),
      liveApiCalled: false,
    };
  }
}
