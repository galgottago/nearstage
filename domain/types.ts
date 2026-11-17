/**
 * Fictional catalog types for the Nearstage demo.
 * Nothing here represents a real person, venue, payment method, or Meta account.
 */

export type EventCategory =
  | "music"
  | "food"
  | "talks"
  | "film"
  | "market"
  | "outdoors";

export type DemoUser = {
  id: string;
  displayName: string;
  handle: string;
  city: string;
  bio: string;
};

/** Document kinds a later vetting revision may require. V1 stores none of them. */
export type VettingDocumentKind = "business-license" | "tax-id";

export type Organizer = {
  id: string;
  name: string;
  kind: "collective" | "venue-host" | "independent";
  /**
   * Shape reserved for the revision-one gate. Always unenforced in v1,
   * and the document slots stay null — no license or tax identifier is stored.
   */
  vetting: {
    gate: "unenforced";
    businessLicense: null;
    taxId: null;
    screening: null;
  };
};

export type Venue = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  blurb: string;
  photoId: string;
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export type Review = {
  id: string;
  targetType: "event" | "venue";
  targetId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  photoId?: string;
  createdAt: string;
};

/** A post is a video plus a short caption. There is no text-only post type. */
export type VideoPost = {
  id: string;
  eventId: string;
  authorName: string;
  caption: string;
  videoSrc: string;
  posterSrc: string;
  createdAt: string;
};

export type CatalogEvent = {
  id: string;
  name: string;
  summary: string;
  venueId: string;
  organizerId: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  capacity: number;
  ticketsSold: number;
  photoIds: string[];
};

export type SearchableEvent = {
  id: string;
  name: string;
  summary: string;
  venueName: string;
  neighborhood: string;
  city: string;
  address: string;
  category: EventCategory;
  startsAt: string;
  priceCents: number;
};

export type EventListing = SearchableEvent & {
  endsAt: string;
  venueId: string;
  organizerId: string;
  organizerName: string;
  venueBlurb: string;
  capacity: number;
  ticketsSold: number;
  lat: number;
  lng: number;
  photos: Photo[];
  reviews: Review[];
  posts: VideoPost[];
};

export type WhenFilter = "any" | "tonight" | "weekend" | "upcoming";
export type PriceFilter = "any" | "free" | "paid";

export type EventSearchCriteria = {
  text?: string;
  location?: string;
  category?: EventCategory | "all";
  price?: PriceFilter;
  when?: WhenFilter;
};

export type TicketableEvent = {
  id: string;
  name: string;
  priceCents: number;
  capacity: number;
  ticketsSold: number;
};

export type TicketQuote = {
  eventId: string;
  eventName: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  providerFeeCents: number;
  totalCents: number;
  providerId: "demo-checkout";
  mode: "demo";
  charged: false;
};

export type DemoOrder = {
  id: string;
  eventId: string;
  eventName: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  buyerName: string;
  providerId: "demo-checkout";
  mode: "demo";
  charged: false;
  reference: string;
  createdAt: string;
};

export type MetaProfileLink = {
  provider: "meta";
  mode: "demo-stub";
  userId: string;
  displayName: string;
  facebookLabel: string;
  instagramLabel: string;
  connectedAt: string;
  /** Always false in v1. A live adapter must not flip this without a real call. */
  liveApiCalled: false;
};

export type MetaAuthorizationHandoff = {
  provider: "meta";
  mode: "demo-stub" | "oauth";
  /** Null in the demo. A later OAuth adapter returns the Meta authorization URL. */
  authorizationUrl: string | null;
  message: string;
};
