import type { Review } from "@/domain/types";

export type ReviewDraftInput = {
  id: string;
  targetType: Review["targetType"];
  targetId: string;
  authorName: string;
  rating: number;
  body: string;
  photoId?: string;
  createdAt: string;
};

export type ReviewDraftResult =
  | { ok: true; review: Review }
  | { ok: false; message: string };

export class ReviewDraft {
  static readonly MAX_LENGTH = 400;

  static create(input: ReviewDraftInput): ReviewDraftResult {
    const authorName = input.authorName.trim();
    const body = input.body.replace(/\s+/g, " ").trim();
    if (authorName.length < 2) {
      return { ok: false, message: "Add the name to show on the review." };
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return { ok: false, message: "Choose a rating from 1 to 5." };
    }
    if (body.length < 8) {
      return { ok: false, message: "Write a short review (at least 8 characters)." };
    }
    if (Array.from(body).length > this.MAX_LENGTH) {
      return {
        ok: false,
        message: `Reviews can be at most ${this.MAX_LENGTH} characters.`,
      };
    }
    const review: Review = {
      id: input.id,
      targetType: input.targetType,
      targetId: input.targetId,
      authorName,
      rating: input.rating as Review["rating"],
      body,
      createdAt: input.createdAt,
    };
    if (input.photoId) {
      review.photoId = input.photoId;
    }
    return { ok: true, review };
  }
}

export class Ratings {
  static average(reviews: Pick<Review, "rating">[]): number | null {
    if (reviews.length === 0) {
      return null;
    }
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
}
