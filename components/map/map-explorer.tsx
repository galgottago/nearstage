"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogView } from "@/domain/catalog";
import { EventCategories, Format } from "@/domain/format";
import { Ratings } from "@/domain/reviews";
import { TicketCheckout } from "@/domain/tickets";
import type { EventCategory, EventSearchCriteria, PriceFilter, WhenFilter } from "@/domain/types";
import { useDemoSession } from "@/components/session/session-provider";
import { EventMap } from "@/components/map/event-map";
import { HoverPreview } from "@/components/map/hover-preview";
import { Stars } from "@/components/events/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories: Array<EventCategory | "all"> = ["all", ...EventCategories.all];
const prices: PriceFilter[] = ["any", "free", "paid"];
const whens: WhenFilter[] = ["any", "tonight", "weekend", "upcoming"];

function readCategory(value: string | null): EventCategory | "all" {
  if (value && EventCategories.all.includes(value as EventCategory)) {
    return value as EventCategory;
  }
  return "all";
}

function readPrice(value: string | null): PriceFilter {
  return value === "free" || value === "paid" ? value : "any";
}

function readWhen(value: string | null): WhenFilter {
  return value === "tonight" || value === "weekend" || value === "upcoming" ? value : "any";
}

export function MapExplorer({ nowIso }: { nowIso: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { session } = useDemoSession();
  const now = new Date(nowIso);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hideTimer = useRef<number | null>(null);

  const criteria = useMemo<EventSearchCriteria>(
    () => ({
      text: params.get("q") ?? "",
      location: params.get("where") ?? "",
      category: readCategory(params.get("category")),
      price: readPrice(params.get("price")),
      when: readWhen(params.get("when")),
    }),
    [params],
  );

  const listings = CatalogView.search(criteria, now, session);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  function show(id: string) {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }
    setHoverId(id);
  }

  function hide(id: string) {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }
    hideTimer.current = window.setTimeout(() => {
      setHoverId((current) => (current === id ? null : current));
    }, 220);
  }

  function setParam(key: string, value: string, empty: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === empty) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }

  const active = listings.find((listing) => listing.id === hoverId) ?? null;

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-6.4rem)] lg:flex-row lg:overflow-hidden">
      <aside className="order-2 flex max-h-[70vh] flex-col border-[#e4d8c4] lg:order-1 lg:max-h-none lg:w-[400px] lg:shrink-0 lg:overflow-hidden lg:border-r">
        <form
          className="space-y-3 border-b border-[#e4d8c4] p-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div>
            <label htmlFor="event-query" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Search
            </label>
            <Input
              id="event-query"
              value={criteria.text ?? ""}
              onChange={(event) => setParam("q", event.target.value, "")}
              placeholder="Name, venue, or word"
              className="mt-1 h-10 bg-card"
            />
          </div>
          <div>
            <label htmlFor="event-where" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Location
            </label>
            <Input
              id="event-where"
              value={criteria.location ?? ""}
              onChange={(event) => setParam("where", event.target.value, "")}
              placeholder="Pearl, Hawthorne, Glasshouse…"
              className="mt-1 h-10 bg-card"
            />
          </div>
          <fieldset>
            <legend className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Category
            </legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  pressed={(criteria.category ?? "all") === category}
                  onClick={() => setParam("category", category, "all")}
                  label={category === "all" ? "All" : EventCategories.label(category)}
                />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-4">
            <ChipRow
              legend="Price"
              values={prices}
              current={criteria.price ?? "any"}
              label={(value) => value[0].toUpperCase() + value.slice(1)}
              onSelect={(value) => setParam("price", value, "any")}
            />
            <ChipRow
              legend="When"
              values={whens}
              current={criteria.when ?? "any"}
              label={(value) => value[0].toUpperCase() + value.slice(1)}
              onSelect={(value) => setParam("when", value, "any")}
            />
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {listings.length} {listings.length === 1 ? "event" : "events"} on the map. Hover a pin
            to preview the review, photo, and video.
          </p>
        </form>
        <ul className="divide-y divide-[#eadfce] overflow-y-auto">
          {listings.length === 0 ? (
            <li className="p-4 text-sm">
              <p>No events match this pass of the city.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => router.replace("/", { scroll: false })}
              >
                Clear filters
              </Button>
            </li>
          ) : null}
          {listings.map((listing) => {
            const average = Ratings.average(listing.reviews);
            const remaining = TicketCheckout.remaining(listing);
            const hot = listing.id === hoverId;
            return (
              <li
                key={listing.id}
                className={hot ? "bg-[#f4e7c8]" : "bg-transparent"}
                onMouseEnter={() => show(listing.id)}
                onMouseLeave={() => hide(listing.id)}
              >
                <div className="flex gap-3 px-4 py-3">
                  <button
                    type="button"
                    className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#1f4d3a] text-sm text-[#f6f1e7]"
                    aria-label={`Preview ${listing.name}`}
                    onFocus={() => show(listing.id)}
                    onBlur={() => hide(listing.id)}
                    onMouseEnter={() => show(listing.id)}
                  >
                    {listing.category.slice(0, 1).toUpperCase()}
                  </button>
                  <div className="min-w-0">
                    <Link href={`/events/${listing.id}`} className="font-heading text-lg leading-tight hover:underline">
                      {listing.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {listing.venueName} · {listing.neighborhood}
                    </p>
                    <p className="mt-1 text-sm">{Format.when(listing.startsAt, listing.endsAt)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline">{EventCategories.label(listing.category)}</Badge>
                      <span>{listing.priceCents === 0 ? "Free" : Format.money(listing.priceCents)}</span>
                      {average !== null ? <Stars rating={average} /> : null}
                      <span className="text-muted-foreground">{remaining} left</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="relative order-1 h-[68vh] min-h-[420px] lg:order-2 lg:h-auto lg:flex-1">
        <EventMap
          listings={listings}
          activeId={hoverId}
          onHover={show}
          onLeave={hide}
          onOpen={(id) => router.push(`/events/${id}`)}
        />
        {active ? (
          <HoverPreview listing={active} onPointerEnter={() => show(active.id)} onPointerLeave={() => hide(active.id)} />
        ) : null}
        {listings.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 rounded-xl bg-[#fbf7f0]/95 px-4 py-3 text-sm shadow">
            The map is clear because nothing matched. Clear a filter to bring the pins back.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "rounded-full bg-[#1f4d3a] px-2.5 py-1 text-xs text-[#f6f1e7]"
          : "rounded-full bg-card px-2.5 py-1 text-xs ring-1 ring-border"
      }
    >
      {label}
    </button>
  );
}

function ChipRow<T extends string>({
  legend,
  values,
  current,
  label,
  onSelect,
}: {
  legend: string;
  values: T[];
  current: T;
  label: (value: T) => string;
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <FilterChip
            key={value}
            pressed={current === value}
            onClick={() => onSelect(value)}
            label={label(value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
