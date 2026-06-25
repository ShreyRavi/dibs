// Curated, web-safe event emojis for the list "logo" picker. Hand-picked to
// render consistently across platforms and cover common group plans.
export const EVENT_EMOJIS = [
  "🎉", "🎂", "🥳", "🎈", "🎊", "🍰",
  "🍻", "🍕", "🏕️", "✈️", "🏖️", "⛰️",
  "🎄", "🎃", "💍", "👶", "🏠", "🎓",
  "🎸", "🏈", "🎮", "🍳", "☕", "🌮",
] as const;

export const DEFAULT_EMOJI = "🎉";

// Guard against junk: keep it short (an emoji, possibly with ZWJ/variation).
export function cleanEmoji(input: string | undefined | null): string {
  const v = (input ?? "").trim();
  return v && v.length <= 12 ? v : DEFAULT_EMOJI;
}
