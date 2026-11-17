"use client";

import dynamic from "next/dynamic";
import type { EventListing } from "@/domain/types";

const EventMapCanvas = dynamic(
  () => import("@/components/map/event-map-canvas").then((mod) => mod.EventMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#e4eee6] text-sm text-muted-foreground">
        Loading the map…
      </div>
    ),
  },
);

export function EventMap(props: {
  listings: EventListing[];
  activeId: string | null;
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return <EventMapCanvas {...props} />;
}
