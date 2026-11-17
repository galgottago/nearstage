# Nearstage

**[Open the demo](http://localhost:43123)**

That link opens the running app. Start it first with the commands below. You can also open [`open-demo.html`](open-demo.html) in a browser, or run `npm run open`.

Nearstage is a fictional demo of location-based events. Pins sit on a Portland basemap. The venues, organizers, reviewers, and the signed-in member are invented. Nothing here is a real profile, a real ticket, or a live Meta connection.

## Run the demo

Requires Node.js 20 or newer and npm. Unzip the folder, open a terminal in that folder (Command Prompt or PowerShell on Windows), and run:

```
npm install
npm run dev
```

Leave that terminal open. Then open [http://localhost:43123](http://localhost:43123), or run `npm run open`.

`npm test` runs the domain tests. It is optional.

The map loads tiles from OpenStreetMap, so browsing the map needs network access. Search, reviews, video posts, the Meta stub, and demo tickets all work from the local catalog plus this browser’s `localStorage`.

## What you can do

- Browse events on the map. Hover a pin, or the icon beside a result, to preview a review, a photo, and a video.
- Search by name and location, and filter by category, price, and when (tonight, weekend, upcoming).
- Open an event or venue to read reviews and photos, and add a demo review.
- Publish a video post with a caption of at most 80 characters. There is no text-only feed.
- Buy a demo ticket. The receipt says the order was not charged.
- Open Profile and connect or remove a **demo** Meta (Facebook/Instagram) link.

The signed-in member is Casey Linden, a fictional demo account. There is no password.

## What is stubbed

| Area | V1 behavior |
| --- | --- |
| Meta | `DemoMetaConnector` never calls Meta. Connect stores a labeled placeholder in `localStorage`. `authorizationUrl` is null. No token is created. |
| Payments | `DemoPaymentProvider` (`demo-checkout`) records an order with `charged: false`. The checkout form does not ask for a card. |
| Organizer vetting | Not built. `OrganizerVetting.ENFORCED` is false. License, tax ID, and AI screening slots stay empty. The demo does not collect those documents. |

## Extension points

- **Meta OAuth** — `MetaOAuthAdapter` in `domain/meta.ts`. Replace `DemoMetaConnector` with an adapter whose `beginAuthorization` returns a real authorization URL, then exchange the code on a server. Do not put access tokens in the demo session.
- **Payments** — `PaymentProvider` in `domain/payments.ts`. `DemoCheckout.place` already accepts a provider. A live one should take a processor token, not a card number typed into this app.
- **Vetting (later revision, not in this demo)** — `OrganizerVettingGate` in `domain/vetting.ts`. Pass a gate into `OrganizerVetting.evaluate(packet, gate)`. A future gate can require `business-license` and `tax-id` references plus a screening result. Keep raw license numbers and tax identifiers out of this demo.

Caption length lives in `CaptionPolicy` (`domain/caption.ts`). Video posts go through `VideoPostPolicy`, which rejects anything without a clip.

## Tests

```bash
npm test
```

Vitest covers the caption limit, video-only posts, search (name, location, filters), the demo ticket flow (quote, no charge, inventory hold), the vetting hook (present, not enforced, replaceable), and the Meta stub (no authorization URL, no live API call).

## Media

`scripts/make-demo-media.py` redraws the fictional stills in `public/photos`. Short silent clips in `public/media` are those stills held as video so hover previews can play. They are generated artwork, not photographs of real events.
