"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { EventCategory, EventListing } from "@/domain/types";

class MapPins {
  private static readonly cache = new Map<string, L.DivIcon>();

  static icon(category: EventCategory, active: boolean): L.DivIcon {
    const key = `${category}:${active ? "on" : "off"}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }
    const icon = L.divIcon({
      className: `nearstage-pin${active ? " is-active" : ""}`,
      html: `<span class="pin-face">${this.mark(category)}</span>`,
      iconSize: active ? [42, 42] : [34, 34],
      iconAnchor: active ? [21, 21] : [17, 17],
    });
    this.cache.set(key, icon);
    return icon;
  }

  private static mark(category: EventCategory): string {
    switch (category) {
      case "music":
        return "♪";
      case "food":
        return "●";
      case "talks":
        return "◇";
      case "film":
        return "▷";
      case "market":
        return "✦";
      case "outdoors":
        return "❀";
    }
  }
}

function FitToEvents({ points }: { points: string }) {
  const map = useMap();
  useEffect(() => {
    if (!points) {
      return;
    }
    const latLngs = points.split(";").map((pair) => {
      const [lat, lng] = pair.split(",").map(Number);
      return L.latLng(lat, lng);
    });
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(latLngs), { padding: [36, 36], maxZoom: 14 });
  }, [map, points]);
  return null;
}

export function EventMapCanvas({
  listings,
  activeId,
  onHover,
  onLeave,
  onOpen,
}: {
  listings: EventListing[];
  activeId: string | null;
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const points = listings.map((listing) => `${listing.lat},${listing.lng}`).join(";");

  return (
    <MapContainer
      center={[45.523, -122.676]}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitToEvents points={points} />
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={MapPins.icon(listing.category, listing.id === activeId)}
          eventHandlers={{
            mouseover: () => onHover(listing.id),
            mouseout: () => onLeave(listing.id),
            click: () => onOpen(listing.id),
          }}
          title={listing.name}
        />
      ))}
    </MapContainer>
  );
}
