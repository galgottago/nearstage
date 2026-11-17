import { SeedCatalog } from "@/domain/seed";
import { EventSearch } from "@/domain/search";
import type { DemoSession } from "@/domain/session";
import type {
  EventListing,
  EventSearchCriteria,
  Organizer,
  Photo,
  Review,
  Venue,
  VideoPost,
} from "@/domain/types";

export class Catalog {
  static listings(now = new Date()): EventListing[] {
    const venues = new Map(SeedCatalog.venues().map((venue) => [venue.id, venue]));
    const organizers = new Map(SeedCatalog.organizers().map((organizer) => [organizer.id, organizer]));
    const photos = new Map(SeedCatalog.photos().map((photo) => [photo.id, photo]));
    const reviews = SeedCatalog.reviews(now);
    const posts = SeedCatalog.videoPosts(now);

    return SeedCatalog.events(now).map((event) => {
      const venue = venues.get(event.venueId);
      const organizer = organizers.get(event.organizerId);
      if (!venue || !organizer) {
        throw new Error(`Catalog is missing venue or organizer for ${event.id}.`);
      }
      return {
        id: event.id,
        name: event.name,
        summary: event.summary,
        venueName: venue.name,
        neighborhood: venue.neighborhood,
        city: venue.city,
        address: venue.address,
        category: event.category,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        priceCents: event.priceCents,
        venueId: venue.id,
        organizerId: organizer.id,
        organizerName: organizer.name,
        venueBlurb: venue.blurb,
        capacity: event.capacity,
        ticketsSold: event.ticketsSold,
        lat: venue.lat,
        lng: venue.lng,
        photos: event.photoIds
          .map((id) => photos.get(id))
          .filter((photo): photo is Photo => Boolean(photo)),
        reviews: reviews.filter(
          (review) => review.targetType === "event" && review.targetId === event.id,
        ),
        posts: posts.filter((post) => post.eventId === event.id),
      };
    });
  }

  static listing(id: string, now = new Date()): EventListing | null {
    return this.listings(now).find((event) => event.id === id) ?? null;
  }

  static venue(id: string): Venue | null {
    return SeedCatalog.venues().find((venue) => venue.id === id) ?? null;
  }

  static organizer(id: string): Organizer | null {
    return SeedCatalog.organizers().find((organizer) => organizer.id === id) ?? null;
  }

  static photo(id: string): Photo | null {
    return SeedCatalog.photos().find((photo) => photo.id === id) ?? null;
  }

  static venueReviews(venueId: string, now = new Date()): Review[] {
    return SeedCatalog.reviews(now).filter(
      (review) => review.targetType === "venue" && review.targetId === venueId,
    );
  }

  static eventsAtVenue(venueId: string, now = new Date()): EventListing[] {
    return this.listings(now).filter((event) => event.venueId === venueId);
  }
}

export class CatalogView {
  static listings(now: Date, session: DemoSession | null): EventListing[] {
    return Catalog.listings(now).map((listing) => this.withSession(listing, session));
  }

  static listing(id: string, now: Date, session: DemoSession | null): EventListing | null {
    const listing = Catalog.listing(id, now);
    return listing ? this.withSession(listing, session) : null;
  }

  static search(
    criteria: EventSearchCriteria,
    now: Date,
    session: DemoSession | null,
  ): EventListing[] {
    const listings = this.listings(now, session);
    const byId = new Map(listings.map((listing) => [listing.id, listing]));
    return EventSearch.query(listings, criteria, now).map((hit) => byId.get(hit.id)!);
  }

  static venueReviews(venueId: string, now: Date, session: DemoSession | null): Review[] {
    const base = Catalog.venueReviews(venueId, now);
    if (!session) {
      return base;
    }
    return [...session.reviewsFor("venue", venueId), ...base];
  }

  static posts(now: Date, session: DemoSession | null): VideoPost[] {
    const seed = SeedCatalog.videoPosts(now);
    const extra = session?.allPosts() ?? [];
    return [...extra, ...seed].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private static withSession(listing: EventListing, session: DemoSession | null): EventListing {
    if (!session) {
      return listing;
    }
    return {
      ...listing,
      ticketsSold: listing.ticketsSold + session.soldCount(listing.id),
      reviews: [...session.reviewsFor("event", listing.id), ...listing.reviews],
      posts: [...session.postsFor(listing.id), ...listing.posts],
    };
  }
}
