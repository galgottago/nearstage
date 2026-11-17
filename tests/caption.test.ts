import { describe, expect, it } from "vitest";
import { CaptionPolicy } from "@/domain/caption";
import { VideoPostPolicy } from "@/domain/posts";
import { SeedCatalog } from "@/domain/seed";

describe("CaptionPolicy", () => {
  it("allows a caption at the limit", () => {
    const caption = "a".repeat(CaptionPolicy.MAX_LENGTH);
    const result = CaptionPolicy.validate(caption);
    expect(CaptionPolicy.MAX_LENGTH).toBe(80);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.caption).toHaveLength(80);
    }
  });

  it("rejects a caption past the limit", () => {
    const result = CaptionPolicy.validate("b".repeat(81));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("too-long");
    }
  });

  it("counts characters after whitespace is collapsed", () => {
    expect(CaptionPolicy.count("  hello   world \n")).toBe(11);
    expect(CaptionPolicy.remaining("hello")).toBe(75);
  });

  it("treats an emoji as one character", () => {
    const caption = `${"a".repeat(79)}🎵`;
    expect(CaptionPolicy.count(caption)).toBe(80);
    expect(CaptionPolicy.validate(caption).ok).toBe(true);
    expect(CaptionPolicy.validate(`${caption}!`).ok).toBe(false);
  });
});

describe("VideoPostPolicy", () => {
  const base = {
    id: "post-1",
    eventId: "evt-lantern",
    authorName: "Casey Linden",
    posterSrc: "/photos/lantern.jpg",
    createdAt: "2026-11-13T19:00:00.000Z",
  };

  it("refuses a text-only post", () => {
    const result = VideoPostPolicy.create({
      ...base,
      caption: "Just words",
      videoSrc: "  ",
    });
    expect(result.ok).toBe(false);
  });

  it("refuses a clip whose caption is too long", () => {
    const result = VideoPostPolicy.create({
      ...base,
      caption: "c".repeat(81),
      videoSrc: "/media/lantern.mp4",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts a video with a short caption", () => {
    const result = VideoPostPolicy.create({
      ...base,
      caption: "  Paper lights.  ",
      videoSrc: "/media/lantern.mp4",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.post.caption).toBe("Paper lights.");
      expect(result.post.videoSrc).toBe("/media/lantern.mp4");
    }
  });

  it("keeps every seeded caption inside the limit and attached to a clip", () => {
    for (const post of SeedCatalog.videoPosts(new Date(2026, 10, 13, 15, 0, 0))) {
      expect(CaptionPolicy.validate(post.caption).ok).toBe(true);
      expect(post.videoSrc.endsWith(".mp4")).toBe(true);
      expect(post.caption.length).toBeLessThanOrEqual(CaptionPolicy.MAX_LENGTH);
    }
  });
});
