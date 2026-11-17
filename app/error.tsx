"use client";

import { Button } from "@/components/ui/button";

export default function DemoError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-4xl">The demo hit a snag.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The catalog is still local. Try the page again.
      </p>
      <Button type="button" className="mt-4" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
