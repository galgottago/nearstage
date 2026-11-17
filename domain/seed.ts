import { Clock } from "@/domain/clock";
import type {
  CatalogEvent,
  DemoUser,
  Organizer,
  Photo,
  Review,
  Venue,
  VideoPost,
} from "@/domain/types";

const emptyVetting = {
  gate: "unenforced" as const,
  businessLicense: null,
  taxId: null,
  screening: null,
};

/**
 * Fictional catalog. Venue pins sit on a real Portland basemap so the demo
 * is browsable; the names, people, and events are invented.
 */
export class SeedCatalog {
  static readonly city = "Portland";

  static currentUser(): DemoUser {
    return {
      id: "user-casey",
      displayName: "Casey Linden",
      handle: "@casey.linden",
      city: "Portland",
      bio: "Demo member of Nearstage. This profile is fictional and is not a real person.",
    };
  }

  static eventIds(): string[] {
    return this.events(new Date(2026, 0, 1, 12, 0, 0)).map((event) => event.id);
  }

  static venueIds(): string[] {
    return this.venues().map((venue) => venue.id);
  }

  static organizers(): Organizer[] {
    return [
      { id: "org-lantern", name: "Lantern House Collective", kind: "collective", vetting: emptyVetting },
      { id: "org-northline", name: "Northline Arts", kind: "collective", vetting: emptyVetting },
      { id: "org-marrow", name: "Marrow Civic Trust", kind: "independent", vetting: emptyVetting },
      { id: "org-copper", name: "Copper Kettle Hospitality", kind: "venue-host", vetting: emptyVetting },
      { id: "org-orchard", name: "Orchard Window Co.", kind: "venue-host", vetting: emptyVetting },
    ];
  }

  static venues(): Venue[] {
    return [
      {
        id: "venue-lantern",
        name: "The Lantern Annex",
        neighborhood: "Pearl District",
        city: "Portland",
        address: "12 Lantern Court, Pearl District",
        lat: 45.5291,
        lng: -122.6846,
        blurb: "A courtyard room behind a fictional print shop, strung with paper lights.",
        photoId: "photo-lantern",
      },
      {
        id: "venue-glasshouse",
        name: "Glasshouse Wharf",
        neighborhood: "South Waterfront",
        city: "Portland",
        address: "4 Wharf Glass Road, South Waterfront",
        lat: 45.4992,
        lng: -122.6704,
        blurb: "A made-up conservatory on the river, used here for jazz and late light.",
        photoId: "photo-glasshouse",
      },
      {
        id: "venue-civic",
        name: "Marrow Civic Hall",
        neighborhood: "Downtown",
        city: "Portland",
        address: "80 Marrow Steps, Downtown",
        lat: 45.5155,
        lng: -122.6789,
        blurb: "An invented civic room with a balcony and a stubborn clock.",
        photoId: "photo-civic",
      },
      {
        id: "venue-copper",
        name: "Copper Kettle Yard",
        neighborhood: "Division",
        city: "Portland",
        address: "221 Kettle Lane, Division",
        lat: 45.5046,
        lng: -122.6298,
        blurb: "A long table in a backyard that exists only in this demo.",
        photoId: "photo-supper",
      },
      {
        id: "venue-rooftop",
        name: "Northline Rooftop",
        neighborhood: "Nob Hill",
        city: "Portland",
        address: "9 Northline Roof, Nob Hill",
        lat: 45.5324,
        lng: -122.6982,
        blurb: "A rooftop screen with the west hills as a backdrop.",
        photoId: "photo-rooftop",
      },
      {
        id: "venue-alberta",
        name: "Alberta Assembly Rooms",
        neighborhood: "Alberta",
        city: "Portland",
        address: "440 Assembly Walk, Alberta",
        lat: 45.5591,
        lng: -122.6448,
        blurb: "A small wood room booked, in this story, by a string quartet.",
        photoId: "photo-quartet",
      },
      {
        id: "venue-orchard",
        name: "Orchard Window",
        neighborhood: "Hawthorne",
        city: "Portland",
        address: "16 Orchard Window, Hawthorne",
        lat: 45.5122,
        lng: -122.6204,
        blurb: "A fruit shop window that becomes a tiny night market on Thursdays.",
        photoId: "photo-orchard",
      },
      {
        id: "venue-shed",
        name: "Mississippi Shed",
        neighborhood: "Mississippi",
        city: "Portland",
        address: "3 Shed Path, Mississippi",
        lat: 45.5514,
        lng: -122.6756,
        blurb: "A riverside shed used as the meeting point for the sketch walk.",
        photoId: "photo-sketch",
      },
    ];
  }

  static photos(): Photo[] {
    return [
      {
        id: "photo-lantern",
        src: "/photos/lantern.jpg",
        alt: "Paper lanterns over a dusk market courtyard",
        caption: "Fictional still: lanterns at the Annex.",
      },
      {
        id: "photo-glasshouse",
        src: "/photos/glasshouse.jpg",
        alt: "A glass conservatory glowing at dusk",
        caption: "Fictional still: Glasshouse Wharf.",
      },
      {
        id: "photo-civic",
        src: "/photos/civic.jpg",
        alt: "Rows of seats in a warm civic hall",
        caption: "Fictional still: Marrow Civic Hall.",
      },
      {
        id: "photo-supper",
        src: "/photos/supper.jpg",
        alt: "A long wooden supper table with candlelight",
        caption: "Fictional still: the Copper Kettle table.",
      },
      {
        id: "photo-rooftop",
        src: "/photos/rooftop.jpg",
        alt: "A rooftop projector facing a night skyline",
        caption: "Fictional still: Northline Rooftop.",
      },
      {
        id: "photo-sketch",
        src: "/photos/sketch.jpg",
        alt: "A waterfront path with sketchbooks on a bench",
        caption: "Fictional still: the sketch-walk meeting point.",
      },
      {
        id: "photo-quartet",
        src: "/photos/quartet.jpg",
        alt: "Four chairs and instruments on a small wooden stage",
        caption: "Fictional still: Alberta Assembly Rooms.",
      },
      {
        id: "photo-orchard",
        src: "/photos/orchard.jpg",
        alt: "Fruit crates and string lights in a shop window at night",
        caption: "Fictional still: Orchard Window.",
      },
    ];
  }

  static events(now = new Date()): CatalogEvent[] {
    const tonight = Clock.evening(now, 19, 30);
    const jazz = Clock.at(now, 1, 20, 0);
    const lecture = Clock.at(now, 2, 18, 30);
    const supper = Clock.at(now, 3, 19, 0);
    const film = Clock.at(now, 4, 20, 30);
    const sketch = Clock.nextWeekday(now, 6, 11, 0);
    const quartet = Clock.nextWeekday(now, 0, 16, 0);
    const orchard = Clock.at(now, 6, 17, 30);

    return [
      this.event(
        "evt-lantern",
        "Lantern Market Night",
        "Stalls, cider, and a short fiddle set once the paper lanterns are lit.",
        "venue-lantern",
        "org-lantern",
        "market",
        tonight,
        2,
        1200,
        80,
        24,
        ["photo-lantern", "photo-orchard"],
      ),
      this.event(
        "evt-jazz",
        "Glasshouse Jazz Hour",
        "A quintet in the conservatory. Seats are benches, not tables.",
        "venue-glasshouse",
        "org-northline",
        "music",
        jazz,
        1.5,
        1800,
        60,
        41,
        ["photo-glasshouse"],
      ),
      this.event(
        "evt-lecture",
        "River Cities Lecture",
        "A free talk on how invented river towns lay out their markets.",
        "venue-civic",
        "org-marrow",
        "talks",
        lecture,
        1.5,
        0,
        120,
        40,
        ["photo-civic"],
      ),
      this.event(
        "evt-supper",
        "Copper Kettle Supper",
        "Five courses at one long table. The menu is short on purpose.",
        "venue-copper",
        "org-copper",
        "food",
        supper,
        3,
        4800,
        24,
        18,
        ["photo-supper"],
      ),
      this.event(
        "evt-film",
        "Rooftop Reel: Night Orchard",
        "A short fictional film projected after the hills go dark.",
        "venue-rooftop",
        "org-northline",
        "film",
        film,
        2,
        1600,
        70,
        12,
        ["photo-rooftop"],
      ),
      this.event(
        "evt-sketch",
        "Wharf Sketch Walk",
        "A slow walk with pencils, meeting at the shed and ending at the water.",
        "venue-shed",
        "org-northline",
        "outdoors",
        sketch,
        2,
        0,
        30,
        9,
        ["photo-sketch", "photo-glasshouse"],
      ),
      this.event(
        "evt-quartet",
        "Harbor String Quartet",
        "An afternoon set with no amplification and a short intermission.",
        "venue-alberta",
        "org-marrow",
        "music",
        quartet,
        1.5,
        2200,
        90,
        33,
        ["photo-quartet"],
      ),
      this.event(
        "evt-orchard",
        "Orchard Window Pop-up",
        "Pears in paper bags, a window reel, and eight-dollar entry.",
        "venue-orchard",
        "org-orchard",
        "market",
        orchard,
        2,
        800,
        40,
        6,
        ["photo-orchard", "photo-lantern"],
      ),
    ];
  }

  static reviews(now = new Date()): Review[] {
    const daysAgo = (days: number, hour: number) =>
      Clock.at(now, -days, hour).toISOString();
    return [
      {
        id: "rev-lantern-1",
        targetType: "event",
        targetId: "evt-lantern",
        authorName: "Nia Pell",
        rating: 5,
        body: "The cider stall and the paper lights. I stayed for the fiddle.",
        photoId: "photo-lantern",
        createdAt: daysAgo(6, 21),
      },
      {
        id: "rev-lantern-2",
        targetType: "event",
        targetId: "evt-lantern",
        authorName: "Jonah Voss",
        rating: 4,
        body: "Crowded by eight. Worth it if you arrive when the lanterns go up.",
        createdAt: daysAgo(4, 18),
      },
      {
        id: "rev-jazz-1",
        targetType: "event",
        targetId: "evt-jazz",
        authorName: "Maren Cho",
        rating: 5,
        body: "Horns under glass. The room stays warm without getting loud.",
        photoId: "photo-glasshouse",
        createdAt: daysAgo(9, 22),
      },
      {
        id: "rev-jazz-2",
        targetType: "event",
        targetId: "evt-jazz",
        authorName: "Idris Hale",
        rating: 4,
        body: "Benches, not cabaret tables. The second tune was the one to hear.",
        createdAt: daysAgo(3, 20),
      },
      {
        id: "rev-lecture-1",
        targetType: "event",
        targetId: "evt-lecture",
        authorName: "Petra Quinn",
        rating: 5,
        body: "Clear talk. The river maps were the part I wrote down.",
        createdAt: daysAgo(12, 19),
      },
      {
        id: "rev-supper-1",
        targetType: "event",
        targetId: "evt-supper",
        authorName: "Sol Weiss",
        rating: 5,
        body: "Five courses, one long table, strangers talking by the second plate.",
        photoId: "photo-supper",
        createdAt: daysAgo(8, 22),
      },
      {
        id: "rev-supper-2",
        targetType: "event",
        targetId: "evt-supper",
        authorName: "June Okonkwo",
        rating: 4,
        body: "The broth course is the one people keep describing badly, in a good way.",
        createdAt: daysAgo(2, 15),
      },
      {
        id: "rev-film-1",
        targetType: "event",
        targetId: "evt-film",
        authorName: "Ellis Hart",
        rating: 5,
        body: "They waited for full dark. The orchard reel fit the roof.",
        photoId: "photo-rooftop",
        createdAt: daysAgo(5, 23),
      },
      {
        id: "rev-sketch-1",
        targetType: "event",
        targetId: "evt-sketch",
        authorName: "Nia Pell",
        rating: 4,
        body: "Pencils, wind, and a patient guide. Bring a stump of charcoal.",
        photoId: "photo-sketch",
        createdAt: daysAgo(15, 13),
      },
      {
        id: "rev-quartet-1",
        targetType: "event",
        targetId: "evt-quartet",
        authorName: "Maren Cho",
        rating: 5,
        body: "You could hear the bow changes. No one clapped early.",
        photoId: "photo-quartet",
        createdAt: daysAgo(11, 17),
      },
      {
        id: "rev-orchard-1",
        targetType: "event",
        targetId: "evt-orchard",
        authorName: "Jonah Voss",
        rating: 4,
        body: "Pears in paper bags and a short film looping in the window.",
        photoId: "photo-orchard",
        createdAt: daysAgo(7, 18),
      },
      {
        id: "rev-venue-lantern",
        targetType: "venue",
        targetId: "venue-lantern",
        authorName: "Ellis Hart",
        rating: 5,
        body: "The courtyard holds a crowd without feeling like a lot.",
        createdAt: daysAgo(20, 16),
      },
      {
        id: "rev-venue-glass",
        targetType: "venue",
        targetId: "venue-glasshouse",
        authorName: "Petra Quinn",
        rating: 4,
        body: "Beautiful room. The benches are honest about being benches.",
        createdAt: daysAgo(18, 12),
      },
      {
        id: "rev-venue-copper",
        targetType: "venue",
        targetId: "venue-copper",
        authorName: "Sol Weiss",
        rating: 5,
        body: "The yard smells like citrus peel and warm copper. In a good way.",
        createdAt: daysAgo(14, 19),
      },
    ];
  }

  static videoPosts(now = new Date()): VideoPost[] {
    const daysAgo = (days: number, hour: number) =>
      Clock.at(now, -days, hour).toISOString();
    return [
      this.post(
        "post-lantern",
        "evt-lantern",
        "Nia Pell",
        "Paper lanterns over the Pearl stalls. Come hungry.",
        "lantern",
        daysAgo(1, 19),
      ),
      this.post(
        "post-jazz",
        "evt-jazz",
        "Maren Cho",
        "The glasshouse holds the horn section just right.",
        "glasshouse",
        daysAgo(2, 21),
      ),
      this.post(
        "post-lecture",
        "evt-lecture",
        "Petra Quinn",
        "A quiet hall, a river map, and no extra slides.",
        "civic",
        daysAgo(3, 18),
      ),
      this.post(
        "post-supper",
        "evt-supper",
        "Sol Weiss",
        "Long table, short menu, copper light.",
        "supper",
        daysAgo(4, 20),
      ),
      this.post(
        "post-film",
        "evt-film",
        "Ellis Hart",
        "Rooftop reel starts when the river goes dark.",
        "rooftop",
        daysAgo(2, 22),
      ),
      this.post(
        "post-sketch",
        "evt-sketch",
        "Nia Pell",
        "Charcoal, wind, and the shed by the path.",
        "sketch",
        daysAgo(6, 11),
      ),
      this.post(
        "post-quartet",
        "evt-quartet",
        "Maren Cho",
        "Four bows, one room, no amplifier.",
        "quartet",
        daysAgo(5, 16),
      ),
      this.post(
        "post-orchard",
        "evt-orchard",
        "Jonah Voss",
        "Orchard window after the rain. Eight dollars.",
        "orchard",
        daysAgo(3, 17),
      ),
    ];
  }

  private static event(
    id: string,
    name: string,
    summary: string,
    venueId: string,
    organizerId: string,
    category: CatalogEvent["category"],
    start: Date,
    hours: number,
    priceCents: number,
    capacity: number,
    ticketsSold: number,
    photoIds: string[],
  ): CatalogEvent {
    return {
      id,
      name,
      summary,
      venueId,
      organizerId,
      category,
      startsAt: start.toISOString(),
      endsAt: Clock.plusHours(start, hours).toISOString(),
      priceCents,
      capacity,
      ticketsSold,
      photoIds,
    };
  }

  private static post(
    id: string,
    eventId: string,
    authorName: string,
    caption: string,
    clip: string,
    createdAt: string,
  ): VideoPost {
    return {
      id,
      eventId,
      authorName,
      caption,
      videoSrc: `/media/${clip}.mp4`,
      posterSrc: `/photos/${clip}.jpg`,
      createdAt,
    };
  }
}
