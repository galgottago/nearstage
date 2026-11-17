"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Catalog, CatalogView } from "@/domain/catalog";
import { Format } from "@/domain/format";
import { Ratings, ReviewDraft } from "@/domain/reviews";
import { SeedCatalog } from "@/domain/seed";
import { useDemoSession } from "@/components/session/session-provider";
import { Stars } from "@/components/events/stars";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function VenueScreen({ venueId, nowIso }: { venueId: string; nowIso: string }) {
  const { session } = useDemoSession();
  const now = new Date(nowIso);
  const user = SeedCatalog.currentUser();
  const venue = Catalog.venue(venueId);
  const photo = venue ? Catalog.photo(venue.photoId) : null;
  const events = Catalog.eventsAtVenue(venueId, now);
  const reviews = CatalogView.venueReviews(venueId, now, session);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const average = Ratings.average(reviews);

  if (!venue) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="font-heading text-3xl">That venue is not in the demo.</h1>
        <Link href="/" className={buttonVariants({ className: "mt-4" })}>
          Back to the map
        </Link>
      </div>
    );
  }

  function submitReview() {
    if (!session || !venue) {
      return;
    }
    const result = ReviewDraft.create({
      id: `rev-${crypto.randomUUID()}`,
      targetType: "venue",
      targetId: venue.id,
      authorName: user.displayName,
      rating,
      body,
      createdAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    session.addReview(result.review);
    setBody("");
    setMessage("Venue review saved in this browser.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1280}
          height={960}
          priority
          className="h-72 w-full rounded-2xl object-cover"
        />
      ) : null}
      <header>
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{venue.neighborhood}</p>
        <h1 className="font-heading text-4xl">{venue.name}</h1>
        <p className="mt-2 max-w-2xl">{venue.blurb}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {venue.address}, {venue.city}
          {average !== null ? (
            <>
              {" · "}
              <Stars rating={average} /> {average}
            </>
          ) : null}
        </p>
      </header>

      <section>
        <h2 className="font-heading text-2xl">Events here</h2>
        <ul className="mt-3 space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.id}`} className="font-medium underline-offset-4 hover:underline">
                {event.name}
              </Link>
              <p className="text-sm text-muted-foreground">{Format.when(event.startsAt, event.endsAt)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl">Venue reviews</h2>
        <ul className="mt-3 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl bg-card p-4 ring-1 ring-border">
              <p className="text-sm">
                <Stars rating={review.rating} /> {review.authorName}
              </p>
              <p className="mt-1">{review.body}</p>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitReview();
          }}
        >
          <div>
            <Label htmlFor="venue-rating">Rating</Label>
            <select
              id="venue-rating"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="mt-1 h-10 w-full max-w-xs rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="venue-review">Review</Label>
            <Textarea id="venue-review" value={body} onChange={(event) => setBody(event.target.value)} className="mt-1" />
          </div>
          {message ? <p className="text-sm">{message}</p> : null}
          <Button type="submit" disabled={!session}>
            Save venue review
          </Button>
        </form>
      </section>
    </div>
  );
}
