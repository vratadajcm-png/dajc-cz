const REGIONAL_INDICATOR_OFFSET = 127397;

export function countryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return "🏳️";
  }
  return String.fromCodePoint(
    ...[...code].map((char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
  );
}
