import dayjs from "dayjs";

import type { LocaleMessages } from "@/i18n";
import type { DateInput } from "./types";

/**
 * Minimal, locale-driven date formatter.
 *
 * Numeric tokens are locale-independent; name tokens (month / weekday) are
 * resolved from the active `LocaleMessages`, so overriding messages also
 * overrides date formatting — no dayjs locale bundles required.
 *
 * Supported tokens: YYYY, MM, M, DD, D, MMMM, ddd, dddd, HH, hh, h, mm, A.
 */
export function formatDate(date: DateInput, pattern: string, messages: LocaleMessages): string {
  const d = dayjs(date);
  const month = d.month(); // 0-11
  const weekday = d.day(); // 0-6, Sunday = 0
  const hour = d.hour();
  const hour12 = hour % 12 || 12;

  const tokens: Record<string, string> = {
    YYYY: String(d.year()),
    MMMM: messages.monthsLong[month],
    MM: String(month + 1).padStart(2, "0"),
    M: String(month + 1),
    DD: String(d.date()).padStart(2, "0"),
    D: String(d.date()),
    dddd: messages.weekdaysLong[weekday],
    ddd: messages.weekdaysShort[weekday],
    HH: String(hour).padStart(2, "0"),
    hh: String(hour12).padStart(2, "0"),
    h: String(hour12),
    mm: String(d.minute()).padStart(2, "0"),
    A: hour < 12 ? "AM" : "PM",
  };

  // Replace longest tokens first to avoid partial collisions (MMMM before MM).
  const ordered = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const re = new RegExp(ordered.join("|"), "g");
  return pattern.replace(re, (m) => tokens[m] ?? m);
}

/** Clock label for an event, honoring the locale's 12/24-hour preference. */
export function formatClock(date: DateInput, messages: LocaleMessages): string {
  return formatDate(date, messages.hour12 ? "h:mm A" : "HH:mm", messages);
}
