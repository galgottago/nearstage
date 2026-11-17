export type CaptionValidation =
  | { ok: true; caption: string }
  | { ok: false; code: "too-long"; message: string };

/**
 * Video posts may carry a short caption and nothing else.
 * The limit is enforced here so the UI and any future writer share one rule.
 */
export class CaptionPolicy {
  static readonly MAX_LENGTH = 80;

  static normalize(caption: string): string {
    return caption.replace(/\s+/g, " ").trim();
  }

  static count(caption: string): number {
    return Array.from(this.normalize(caption)).length;
  }

  static remaining(caption: string): number {
    return this.MAX_LENGTH - this.count(caption);
  }

  static validate(caption: string): CaptionValidation {
    const normalized = this.normalize(caption);
    if (this.count(caption) > this.MAX_LENGTH) {
      return {
        ok: false,
        code: "too-long",
        message: `Captions can be at most ${this.MAX_LENGTH} characters.`,
      };
    }
    return { ok: true, caption: normalized };
  }
}
