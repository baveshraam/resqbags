/**
 * Time parsing and validation utilities for merchant pickup windows.
 *
 * Supported formats:
 *   "6:00 PM", "06:00 PM", "9:00 PM", "09:00 PM"  (12-hour)
 *   "18:00", "21:00"                                (24-hour)
 *
 * Rejected:
 *   "adsads", "25:00", "13:90", ""
 */

interface ParsedTime {
  hours: number;   // 0–23
  minutes: number; // 0–59
}

interface PickupWindowResult {
  valid: boolean;
  startISO?: string;
  endISO?: string;
  error?: string;
}

/**
 * Parse a human-readable time string into hours + minutes.
 * Returns null for any invalid input.
 */
export function parseTimeText(timeText: string): ParsedTime | null {
  if (!timeText || typeof timeText !== 'string') return null;

  const text = timeText.trim();
  if (text.length === 0) return null;

  // Match "H:MM AM/PM" or "HH:MM AM/PM" or "H:MM" or "HH:MM"
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
  const match = text.match(timeRegex);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  // Validate minutes
  if (minutes > 59) return null;

  if (meridiem) {
    // 12-hour format
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    // 24-hour format
    if (hours > 23) return null;
  }

  return { hours, minutes };
}

/**
 * Validate a pickup window defined by two time strings.
 *
 * Logic:
 *  1. Parse both start and end into { hours, minutes }.
 *  2. Build start Date: if start time has already passed today, move to tomorrow.
 *  3. Build end Date on the SAME day as start.
 *  4. If end <= start, move end to the next day (overnight window, e.g. 11 PM → 1 AM).
 *  5. Reject if the resulting window > 12 hours (sanity).
 *  6. Return ISO strings.
 */
export function validatePickupWindow(
  startText: string,
  endText: string
): PickupWindowResult {
  const startParsed = parseTimeText(startText);
  const endParsed = parseTimeText(endText);

  if (!startParsed) {
    return { valid: false, error: 'Start time is invalid. Use format like 6:00 PM or 18:00.' };
  }
  if (!endParsed) {
    return { valid: false, error: 'End time is invalid. Use format like 9:00 PM or 21:00.' };
  }

  const now = new Date();

  // Build start date
  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startParsed.hours,
    startParsed.minutes,
    0,
    0
  );

  // If start has already passed today, move to tomorrow
  if (startDate.getTime() < now.getTime()) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // Build end date on the SAME day as start
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    endParsed.hours,
    endParsed.minutes,
    0,
    0
  );

  // If end is at or before start on the same calendar day,
  // assume overnight window — move end to the next day.
  // E.g. start = 11:00 PM, end = 1:00 AM → end becomes next day 1 AM.
  if (endDate.getTime() <= startDate.getTime()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  // Sanity: reject windows longer than 12 hours
  const windowMs = endDate.getTime() - startDate.getTime();
  const windowHours = windowMs / (1000 * 60 * 60);
  if (windowHours > 12) {
    return {
      valid: false,
      error: 'Pickup window cannot exceed 12 hours.',
    };
  }

  return {
    valid: true,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
}

/**
 * Legacy compatibility helper — parses a single time to ISO.
 * Prefer validatePickupWindow() for paired start/end.
 */
export function parsePickupTimeToISO(timeText: string): string | null {
  const parsed = parseTimeText(timeText);
  if (!parsed) return null;

  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parsed.hours,
    parsed.minutes,
    0,
    0
  );

  if (date.getTime() < now.getTime()) {
    date.setDate(date.getDate() + 1);
  }

  return date.toISOString();
}
