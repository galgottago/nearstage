"use client";

import { useState } from "react";
import Link from "next/link";
import { CatalogView } from "@/domain/catalog";
import { CaptionPolicy } from "@/domain/caption";
import { Format } from "@/domain/format";
import { VideoPostPolicy } from "@/domain/posts";
import { SeedCatalog } from "@/domain/seed";
import { useDemoSession } from "@/components/session/session-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const clips = [
  { id: "lantern", label: "Lantern courtyard", videoSrc: "/media/lantern.mp4", posterSrc: "/photos/lantern.jpg" },
  { id: "glasshouse", label: "Glasshouse dusk", videoSrc: "/media/glasshouse.mp4", posterSrc: "/photos/glasshouse.jpg" },
  { id: "civic", label: "Civic hall", videoSrc: "/media/civic.mp4", posterSrc: "/photos/civic.jpg" },
  { id: "supper", label: "Supper table", videoSrc: "/media/supper.mp4", posterSrc: "/photos/supper.jpg" },
  { id: "rooftop", label: "Rooftop reel", videoSrc: "/media/rooftop.mp4", posterSrc: "/photos/rooftop.jpg" },
  { id: "sketch", label: "Sketch walk", videoSrc: "/media/sketch.mp4", posterSrc: "/photos/sketch.jpg" },
  { id: "quartet", label: "Quartet stage", videoSrc: "/media/quartet.mp4", posterSrc: "/photos/quartet.jpg" },
  { id: "orchard", label: "Orchard window", videoSrc: "/media/orchard.mp4", posterSrc: "/photos/orchard.jpg" },
];

export function PostsScreen({ nowIso }: { nowIso: string }) {
  const { session } = useDemoSession();
  const now = new Date(nowIso);
  const user = SeedCatalog.currentUser();
  const listings = CatalogView.listings(now, session);
  const posts = CatalogView.posts(now, session);
  const [eventId, setEventId] = useState("evt-lantern");
  const [clipId, setClipId] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const length = CaptionPolicy.count(caption);
  const over = length > CaptionPolicy.MAX_LENGTH;
  const clip = clips.find((item) => item.id === clipId) ?? null;

  function publish() {
    if (!session) {
      return;
    }
    const result = VideoPostPolicy.create({
      id: `post-${crypto.randomUUID()}`,
      eventId,
      authorName: user.displayName,
      caption,
      videoSrc: clip?.videoSrc ?? "",
      posterSrc: clip?.posterSrc ?? "",
      createdAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    session.addPost(result.post);
    setCaption("");
    setClipId("");
    setError(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Video posts</p>
      <h1 className="font-heading text-4xl">Clips, not essays</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        A post is a video and a caption of at most {CaptionPolicy.MAX_LENGTH} characters. There is
        no text-only feed.
      </p>

      <form
        className="mt-6 space-y-4 rounded-2xl bg-card p-5 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          publish();
        }}
      >
        <div>
          <Label htmlFor="post-event">Event</Label>
          <select
            id="post-event"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Clip</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {clips.map((item) => (
              <label
                key={item.id}
                className={
                  clipId === item.id
                    ? "flex cursor-pointer items-center gap-2 rounded-lg bg-[#f4e7c8] px-3 py-2 text-sm"
                    : "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-border"
                }
              >
                <input
                  type="radio"
                  name="clip"
                  value={item.id}
                  checked={clipId === item.id}
                  onChange={() => setClipId(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="A line about the clip. Optional, and short."
            className="mt-1"
            aria-invalid={over}
          />
          <p className={over ? "mt-1 text-sm text-destructive" : "mt-1 text-sm text-muted-foreground"}>
            {length}/{CaptionPolicy.MAX_LENGTH}
            {over ? ` — ${CaptionPolicy.validate(caption).ok ? "" : "Captions can be at most 80 characters."}` : ""}
          </p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={!session || over || !clip}>
          Publish video
        </Button>
      </form>

      <ul className="mt-8 space-y-6">
        {posts.map((post) => {
          const listing = listings.find((item) => item.id === post.eventId);
          return (
            <li key={post.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
              <video
                className="aspect-video w-full bg-black"
                src={post.videoSrc}
                poster={post.posterSrc}
                controls
                playsInline
                preload="metadata"
              />
              <div className="px-4 py-3">
                <p>{post.caption || "No caption"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {post.authorName} · {Format.timestamp(post.createdAt)} · {post.caption.length}/
                  {CaptionPolicy.MAX_LENGTH}
                  {listing ? (
                    <>
                      {" · "}
                      <Link href={`/events/${listing.id}`} className="underline-offset-4 hover:underline">
                        {listing.name}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
