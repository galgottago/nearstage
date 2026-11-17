"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Catalog, CatalogView } from "@/domain/catalog";
import { EventCategories, Format } from "@/domain/format";
import { Ratings, ReviewDraft } from "@/domain/reviews";
import { SeedCatalog } from "@/domain/seed";
import { TicketCheckout } from "@/domain/tickets";
import { OrganizerVetting } from "@/domain/vetting";
import { useDemoSession } from "@/components/session/session-provider";
import { Stars } from "@/components/events/stars";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EventScreen({ eventId, nowIso }: { eventId: string; nowIso: string }) {
  const { session } = useDemoSession();
  const now = new Date(nowIso);
  const user = SeedCatalog.currentUser();
  const listing = CatalogView.listing(eventId, now, session);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="font-heading text-3xl">That event is not in the demo.</h1>
        <Link href="/" className={buttonVariants({ className: "mt-4" })}>
          Back to the map
        </Link>
      </div>
    );
  }

  const average = Ratings.average(listing.reviews);
  const remaining = TicketCheckout.remaining(listing);
  const vetting = OrganizerVetting.evaluate(OrganizerVetting.emptyPacket(listing.organizerId));
  const hero = listing.photos[0];

  function submitReview() {
    const result = ReviewDraft.create({
      id: `rev-${crypto.randomUUID()}`,
      targetType: "event",
      targetId: listing!.id,
      authorName: user.displayName,
      rating,
      body,
      photoId: photoId || undefined,
      createdAt: new Date().toISOString(),
    });
    if (!session) {
      setMessage("The demo store is still opening in this browser.");
      return;
    }
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    session.addReview(result.review);
    setBody("");
    setMessage("Review saved in this browser. It is part of the demo, not a public post.");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="space-y-8">
        {hero ? (
          <Image
            src={hero.src}
            alt={hero.alt}
            width={1280}
            height={960}
            priority
            className="h-72 w-full rounded-2xl object-cover sm:h-96"
          />
        ) : null}
        <header>
          <Badge variant="outline">{EventCategories.label(listing.category)}</Badge>
          <h1 className="mt-2 font-heading text-4xl leading-tight sm:text-5xl">{listing.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{listing.summary}</p>
          <p className="mt-3 text-sm">
            {Format.when(listing.startsAt, listing.endsAt)}
            {" · "}
            <Link href={`/venues/${listing.venueId}`} className="underline-offset-4 hover:underline">
              {listing.venueName}
            </Link>
            {" · "}
            {listing.neighborhood}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{listing.address}</p>
          <p className="mt-4 text-sm">
            Hosted by {listing.organizerName}.{" "}
            {vetting.enforced
              ? "Vetting is on."
              : "Organizer vetting is not enforced in this demo."}
          </p>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            A later revision can require a business license, a tax ID, and AI screening through
            OrganizerVettingGate. This demo does not collect or store those documents.
          </p>
        </header>

        <section>
          <h2 className="font-heading text-2xl">Photos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {listing.photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
                <Image src={photo.src} alt={photo.alt} width={1280} height={960} className="h-52 w-full object-cover" />
                <figcaption className="px-3 py-2 text-sm text-muted-foreground">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl">Video</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Posts on Nearstage are video only, with a caption of at most 80 characters.
          </p>
          <ul className="mt-3 space-y-4">
            {listing.posts.map((post) => (
              <li key={post.id} className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
                <video
                  className="aspect-video w-full bg-black"
                  src={post.videoSrc}
                  poster={post.posterSrc}
                  controls
                  playsInline
                  preload="metadata"
                />
                <div className="px-3 py-3 text-sm">
                  <p>{post.caption || "No caption"}</p>
                  <p className="mt-1 text-muted-foreground">
                    {post.authorName} · {Format.timestamp(post.createdAt)} · {post.caption.length}/80
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/posts" className="mt-3 inline-block text-sm underline-offset-4 hover:underline">
            Post a video
          </Link>
        </section>

        <section>
          <h2 className="font-heading text-2xl">
            Reviews{" "}
            <span className="text-base text-muted-foreground">
              {average !== null ? (
                <>
                  <Stars rating={average} /> {average} · {listing.reviews.length}
                </>
              ) : (
                "None yet"
              )}
            </span>
          </h2>
          <ul className="mt-3 space-y-3">
            {listing.reviews.map((review) => {
              const photo = review.photoId ? Catalog.photo(review.photoId) : null;
              return (
                <li key={review.id} className="rounded-xl bg-card p-4 ring-1 ring-border">
                  <p className="text-sm">
                    <Stars rating={review.rating} /> <span className="font-medium">{review.authorName}</span>
                  </p>
                  <p className="mt-1">{review.body}</p>
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={640}
                      height={480}
                      className="mt-3 h-36 w-full rounded-lg object-cover sm:w-64"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
          <form
            className="mt-4 space-y-3 rounded-xl bg-card p-4 ring-1 ring-border"
            onSubmit={(event) => {
              event.preventDefault();
              submitReview();
            }}
          >
            <h3 className="font-heading text-xl">Add a review</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="review-photo">Attach a demo still</Label>
                <select
                  id="review-photo"
                  value={photoId}
                  onChange={(event) => setPhotoId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">No photo</option>
                  {SeedCatalog.photos().map((photo) => (
                    <option key={photo.id} value={photo.id}>
                      {photo.caption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="review-body">Review</Label>
              <Textarea
                id="review-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                maxLength={ReviewDraft.MAX_LENGTH}
                placeholder={`Signed in as ${user.displayName}. This stays in the demo.`}
                className="mt-1"
              />
            </div>
            {message ? <p className="text-sm">{message}</p> : null}
            <Button type="submit" disabled={!session}>
              Save review
            </Button>
          </form>
        </section>
      </article>

      <aside className="h-fit rounded-2xl bg-card p-5 ring-1 ring-border lg:sticky lg:top-28">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Tickets</p>
        <p className="mt-2 font-heading text-3xl">
          {listing.priceCents === 0 ? "Free" : Format.money(listing.priceCents)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {remaining} of {listing.capacity} still open in this demo.
        </p>
        {remaining > 0 ? (
          <Link href={`/checkout/${listing.id}`} className={buttonVariants({ className: "mt-4 w-full" })}>
            {listing.priceCents === 0 ? "Reserve a demo ticket" : "Buy demo tickets"}
          </Link>
        ) : (
          <p className="mt-4 text-sm">Sold out in this demo.</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Checkout is labeled as a demo purchase. No card is collected and nobody is charged.
        </p>
      </aside>
    </div>
  );
}
