"use client";

import { useState } from "react";
import { DemoMetaConnector } from "@/domain/meta";
import { SeedCatalog } from "@/domain/seed";
import { Format } from "@/domain/format";
import { useDemoSession } from "@/components/session/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProfileScreen() {
  const { session } = useDemoSession();
  const user = SeedCatalog.currentUser();
  const [notice, setNotice] = useState<string | null>(null);
  const link = session?.meta(user.id) ?? null;

  function connect() {
    if (!session) {
      return;
    }
    const connector = new DemoMetaConnector();
    const handoff = connector.beginAuthorization(user.id);
    if (handoff.authorizationUrl) {
      setNotice("A live Meta redirect is not part of this demo.");
      return;
    }
    session.linkMeta(DemoMetaConnector.link(user.id, user.displayName));
    setNotice(handoff.message);
  }

  function disconnect() {
    session?.clearMeta(user.id);
    setNotice("Demo Meta link removed from this browser. No Meta account was changed.");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-2xl bg-card p-6 ring-1 ring-border">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Signed in</p>
        <h1 className="mt-2 font-heading text-4xl">{user.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.handle} · {user.city}
        </p>
        <p className="mt-4 text-sm leading-6">{user.bio}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          This member is part of the fiction. There is no password and no real profile behind it.
        </p>
      </section>

      <section className="rounded-2xl bg-card p-6 ring-1 ring-border" aria-labelledby="meta-heading">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="meta-heading" className="font-heading text-3xl">
            Meta profile
          </h2>
          <Badge variant="secondary">Demo stub</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect a Facebook or Instagram profile. This build does not call Meta, does not open an
          OAuth window, and does not store a token.
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <dt>Facebook</dt>
            <dd className="text-right">{link ? link.facebookLabel : "Not linked"}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <dt>Instagram</dt>
            <dd className="text-right">{link ? link.instagramLabel : "Not linked"}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt>Status</dt>
            <dd className="text-right">
              {link
                ? `Linked ${Format.timestamp(link.connectedAt)} as ${link.displayName}`
                : "No Meta profile linked"}
            </dd>
          </div>
        </dl>

        {link ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Mode {link.mode}. liveApiCalled is {String(link.liveApiCalled)}. The labels above are
            placeholders, not accounts you can open.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {link ? (
            <Button type="button" variant="outline" onClick={disconnect} disabled={!session}>
              Disconnect demo link
            </Button>
          ) : (
            <Button type="button" onClick={connect} disabled={!session}>
              Connect demo Meta profile
            </Button>
          )}
        </div>
        {notice ? <p className="mt-3 text-sm">{notice}</p> : null}

        <aside className="mt-6 rounded-xl border border-dashed border-[#1f4d3a]/40 p-4 text-sm">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Extension point</p>
          <p className="mt-2">
            MetaOAuthAdapter.beginAuthorization is where a later build starts Facebook or Instagram
            login. DemoMetaConnector returns an empty authorization URL so this button cannot leave
            the demo.
          </p>
        </aside>
      </section>
    </div>
  );
}
