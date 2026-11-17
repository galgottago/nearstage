/**
 * All catalog times are wall-clock times in Portland.
 * Server and browser can sit in different zones; the demo city does not.
 */
export class Clock {
  static readonly zone = "America/Los_Angeles";

  static plusHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  static parts(date: Date): { year: number; month: number; day: number; weekday: number } {
    const bag = this.partBag(date, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
    const weekdays: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return {
      year: Number(bag.year),
      month: Number(bag.month),
      day: Number(bag.day),
      weekday: weekdays[bag.weekday] ?? 0,
    };
  }

  /** Wall-clock time in Portland, including day overflow (day 32 rolls into the next month). */
  static zoned(year: number, month: number, day: number, hour: number, minute = 0): Date {
    const utc = Date.UTC(year, month - 1, day, hour, minute, 0);
    const first = this.offsetMinutes(new Date(utc));
    let result = new Date(utc - first * 60 * 1000);
    const second = this.offsetMinutes(result);
    if (second !== first) {
      result = new Date(utc - second * 60 * 1000);
    }
    return result;
  }

  static startOfDay(date: Date): Date {
    const parts = this.parts(date);
    return this.zoned(parts.year, parts.month, parts.day, 0, 0);
  }

  static endOfDay(date: Date): Date {
    return new Date(this.at(date, 1, 0, 0).getTime() - 1);
  }

  static at(now: Date, dayOffset: number, hour: number, minute = 0): Date {
    const parts = this.parts(now);
    return this.zoned(parts.year, parts.month, parts.day + dayOffset, hour, minute);
  }

  /** Evening on the Portland day, or the next day if that hour is already close. */
  static evening(now: Date, hour: number, minute = 0): Date {
    const candidate = this.at(now, 0, hour, minute);
    if (candidate.getTime() <= now.getTime() + 30 * 60 * 1000) {
      return this.at(now, 1, hour, minute);
    }
    return candidate;
  }

  static nextWeekday(now: Date, weekday: number, hour: number, minute = 0): Date {
    const parts = this.parts(now);
    const delta = (weekday - parts.weekday + 7) % 7;
    if (delta === 0 && this.at(now, 0, hour, minute).getTime() <= now.getTime()) {
      return this.at(now, 7, hour, minute);
    }
    return this.at(now, delta, hour, minute);
  }

  private static offsetMinutes(instant: Date): number {
    const bag = this.partBag(instant, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    let hour = Number(bag.hour);
    let day = Number(bag.day);
    if (hour === 24) {
      hour = 0;
      day += 1;
    }
    const asUtc = Date.UTC(
      Number(bag.year),
      Number(bag.month) - 1,
      day,
      hour,
      Number(bag.minute),
      Number(bag.second),
    );
    return Math.round((asUtc - instant.getTime()) / 60000);
  }

  private static partBag(
    date: Date,
    options: Intl.DateTimeFormatOptions,
  ): Record<string, string> {
    return Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { ...options, timeZone: this.zone })
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
  }
}
