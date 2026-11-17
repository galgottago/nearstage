import { Clock } from "@/domain/clock";
import type {
  EventSearchCriteria,
  SearchableEvent,
  WhenFilter,
} from "@/domain/types";

export class EventSearch {
  static query<T extends SearchableEvent>(
    events: T[],
    criteria: EventSearchCriteria,
    now = new Date(),
  ): T[] {
    const text = (criteria.text ?? "").trim().toLowerCase();
    const location = (criteria.location ?? "").trim().toLowerCase();
    const category = criteria.category ?? "all";
    const price = criteria.price ?? "any";
    const when = criteria.when ?? "any";

    return events
      .filter((event) => {
        if (text) {
          const haystack = [
            event.name,
            event.summary,
            event.venueName,
            event.neighborhood,
            event.city,
            event.category,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(text)) {
            return false;
          }
        }
        if (location) {
          const place = [event.neighborhood, event.city, event.venueName, event.address]
            .join(" ")
            .toLowerCase();
          if (!place.includes(location)) {
            return false;
          }
        }
        if (category !== "all" && event.category !== category) {
          return false;
        }
        if (price === "free" && event.priceCents !== 0) {
          return false;
        }
        if (price === "paid" && event.priceCents === 0) {
          return false;
        }
        return this.matchesWhen(event.startsAt, when, now);
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  static matchesWhen(startsAt: string, when: WhenFilter, now: Date): boolean {
    if (when === "any") {
      return true;
    }
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) {
      return false;
    }
    if (when === "upcoming") {
      return start.getTime() >= Clock.startOfDay(now).getTime();
    }
    if (when === "tonight") {
      const open = Clock.at(now, 0, 17, 0);
      const close = Clock.endOfDay(now);
      return start >= open && start <= close;
    }
    const bounds = this.weekendBounds(now);
    return start >= bounds.start && start <= bounds.end;
  }

  /** Saturday 00:00 through Sunday night, in Portland. */
  static weekendBounds(now: Date): { start: Date; end: Date } {
    const day = Clock.parts(now).weekday;
    const saturdayOffset = day === 0 ? -1 : day === 6 ? 0 : 6 - day;
    const start = Clock.at(now, saturdayOffset, 0, 0);
    const end = new Date(Clock.at(now, saturdayOffset + 2, 0, 0).getTime() - 1);
    return { start, end };
  }
}
