import type { EventCategory } from "@/domain/types";

export class EventCategories {
  static readonly all: EventCategory[] = [
    "music",
    "food",
    "talks",
    "film",
    "market",
    "outdoors",
  ];

  static label(category: EventCategory): string {
    switch (category) {
      case "music":
        return "Music";
      case "food":
        return "Food";
      case "talks":
        return "Talks";
      case "film":
        return "Film";
      case "market":
        return "Market";
      case "outdoors":
        return "Outdoors";
    }
  }
}

export class Format {
  static money(cents: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }

  static when(startsAt: string, endsAt: string): string {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(start);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    });
    return `${date} · ${time.format(start)}–${time.format(end)}`;
  }

  static timestamp(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  }
}
