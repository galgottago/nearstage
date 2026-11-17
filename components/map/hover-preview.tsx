"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventCategories, Format } from "@/domain/format";
import { Ratings } from "@/domain/reviews";
import { TicketCheckout } from "@/domain/tickets";
import type { EventListing } from "@/domain/types";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/events/stars";

export function HoverPreview({
  listing,
  onPointerEnter,
  onPointerLeave,
}: {
  listing: EventListing;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const photo = listing.photos[0];
  const post = listing.posts[0];
  const review = listing.reviews[0];
  const average = Ratings.average(listing.reviews);
  const remaining = TicketCheckout.remaining(listing);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.play().catch(() => undefined);
  }, [post?.id]);

  return (
    <article
      className="absolute inset-x-3 bottom-3 z-[1000] max-h-[70%] overflow-auto rounded-2xl bg-[#fbf7f0] p-3 text-[#1c2a24] shadow-2xl ring-1 ring-black/10 sm:inset-x-auto sm:left-4 sm:w-[360px]"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#6d6254] uppercase">
        Preview · {EventCategories.label(listing.category)}
      </p>
      <h2 className="font-heading text-2xl leading-tight">{listing.name}</h2>
      <p className="mt-1 text-sm text-[#5c564c]">
        {listing.venueName} · {Format.when(listing.startsAt, listing.endsAt)}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            width={640}
            height={480}
            className="h-28 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="h-28 rounded-lg bg-[#e7efe8]" />
        )}
        {post ? (
          <video
            key={post.id}
            ref={videoRef}
            className="h-28 w-full rounded-lg bg-black object-cover"
            src={post.videoSrc}
            poster={post.posterSrc}
            muted
            loop
            playsInline
            autoPlay
            controls
            aria-label={`Video preview: ${post.caption || listing.name}`}
          />
        ) : (
          <div className="grid h-28 place-items-center rounded-lg bg-[#1c3a32] text-xs text-[#f6f1e7]">
            No video yet
          </div>
        )}
      </div>
      {post ? (
        <p className="mt-2 text-sm">
          <span className="text-[#6d6254]">{post.authorName}: </span>
          {post.caption || "No caption"}
        </p>
      ) : null}
      {review ? (
        <p className="mt-2 text-sm">
          {average !== null ? <Stars rating={average} /> : null}{" "}
          <span className="text-[#5c564c]">
            {review.authorName}: “{review.body}”
          </span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-[#6d6254]">No reviews yet.</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          {listing.priceCents === 0 ? "Free" : Format.money(listing.priceCents)}
          <span className="text-[#6d6254]"> · {remaining} left</span>
        </p>
        <Link href={`/events/${listing.id}`} className={buttonVariants({ size: "sm" })}>
          Open event
        </Link>
      </div>
    </article>
  );
}
