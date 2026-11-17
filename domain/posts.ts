import { CaptionPolicy } from "@/domain/caption";
import type { VideoPost } from "@/domain/types";

export type VideoPostDraft = {
  id: string;
  eventId: string;
  authorName: string;
  caption: string;
  videoSrc: string;
  posterSrc: string;
  createdAt: string;
};

export type VideoPostResult =
  | { ok: true; post: VideoPost }
  | { ok: false; message: string };

/** Posts are video-only. A caption is optional and capped by CaptionPolicy. */
export class VideoPostPolicy {
  static create(input: VideoPostDraft): VideoPostResult {
    const videoSrc = input.videoSrc.trim();
    if (!videoSrc) {
      return {
        ok: false,
        message: "Posts are video-only. Choose a clip before publishing.",
      };
    }
    if (!input.eventId.trim()) {
      return { ok: false, message: "Attach the clip to an event." };
    }
    const authorName = input.authorName.trim();
    if (authorName.length < 2) {
      return { ok: false, message: "Add the name to show on the post." };
    }
    const caption = CaptionPolicy.validate(input.caption);
    if (!caption.ok) {
      return { ok: false, message: caption.message };
    }
    return {
      ok: true,
      post: {
        id: input.id,
        eventId: input.eventId,
        authorName,
        caption: caption.caption,
        videoSrc,
        posterSrc: input.posterSrc.trim() || videoSrc,
        createdAt: input.createdAt,
      },
    };
  }
}
