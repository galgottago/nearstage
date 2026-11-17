import { describe, expect, it } from "vitest";
import { Catalog } from "@/domain/catalog";
import { Clock } from "@/domain/clock";
import { EventSearch } from "@/domain/search";
import type { SearchableEvent } from "@/domain/types";

const now = Clock.zoned(2026, 11, 13, 15, 0);

function at(day: number, hour: number, minute = 0): string {
  return Clock.zoned(2026, 11, day, hour, minute).toISOString();
}

function event(partial: Partial<SearchableEvent> & Pick<SearchableEvent, "id" | "name" | "startsAt">): SearchableEvent {
  return {
    summary: "",
    venueName: "Hall",
    neighborhood: "Pearl District",
    city: "Portland",
    address: "1 Demo Street",
    category: "music",
    priceCents: 1000,
    ...partial,
  };
}

describe("EventSearch", () => {
  const events: SearchableEvent[] = [
    event({
      id: "jazz",
      name: "Glasshouse Jazz Hour",
      summary: "Horns under glass",
      venueName: "Glasshouse Wharf",
      neighborhood: "South Waterfront",
      category: "music",
      startsAt: at(13, 19, 30),
      priceCents: 1800,
    }),
    event({
      id: "lecture",
      name: "River Cities Lecture",
      venueName: "Marrow Civic Hall",
      neighborhood: "Downtown",
      category: "talks",
      startsAt: at(14, 18, 30),
      priceCents: 0,
    }),
    event({
      id: "sketch",
      name: "Wharf Sketch Walk",
      venueName: "Mississippi Shed",
      neighborhood: "Mississippi",
      category: "outdoors",
      startsAt: at(14, 11, 0),
      priceCents: 0,
    }),
    event({
      id: "old",
      name: "Last Week Quartet",
      startsAt: at(10, 16, 0),
      priceCents: 2200,
    }),
  ];

  it("matches a name regardless of case", () => {
    const found = EventSearch.query(events, { text: "jazz" }, now);
    expect(found.map((item) => item.id)).toEqual(["jazz"]);
  });

  it("matches a neighborhood, city, or venue through the location field", () => {
    expect(EventSearch.query(events, { location: "mississippi" }, now).map((item) => item.id)).toEqual([
      "sketch",
    ]);
    expect(EventSearch.query(events, { location: "glasshouse" }, now)).toHaveLength(1);
    expect(EventSearch.query(events, { location: "portland" }, now)).toHaveLength(4);
  });

  it("combines category and price filters", () => {
    const freeTalks = EventSearch.query(events, { category: "talks", price: "free" }, now);
    expect(freeTalks.map((item) => item.id)).toEqual(["lecture"]);
    const paidMusic = EventSearch.query(events, { category: "music", price: "paid" }, now);
    expect(paidMusic.map((item) => item.id).sort()).toEqual(["jazz", "old"]);
  });

  it("filters tonight, weekend, and upcoming against a fixed clock", () => {
    expect(EventSearch.query(events, { when: "tonight" }, now).map((item) => item.id)).toEqual(["jazz"]);
    expect(EventSearch.query(events, { when: "weekend" }, now).map((item) => item.id)).toEqual([
      "sketch",
      "lecture",
    ]);
    expect(EventSearch.query(events, { when: "upcoming" }, now).map((item) => item.id)).toEqual([
      "jazz",
      "sketch",
      "lecture",
    ]);
  });

  it("sorts matches by start time", () => {
    const found = EventSearch.query(events, { text: "" }, now);
    const stamps = found.map((item) => item.startsAt);
    expect([...stamps].sort()).toEqual(stamps);
  });

  it("finds a seeded event by name and by neighborhood", () => {
    const listings = Catalog.listings(Clock.zoned(2026, 11, 13, 15, 0));
    expect(EventSearch.query(listings, { text: "Lantern" }, now).map((item) => item.id)).toEqual([
      "evt-lantern",
    ]);
    const pearl = EventSearch.query(listings, { location: "Pearl" }, now);
    expect(pearl.every((item) => item.neighborhood === "Pearl District")).toBe(true);
    expect(pearl.length).toBeGreaterThan(0);
    const tonight = EventSearch.query(listings, { when: "tonight" }, now);
    expect(tonight.some((item) => item.id === "evt-lantern")).toBe(true);
  });
});
