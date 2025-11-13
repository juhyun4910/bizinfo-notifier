export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function parsePeriod(input?: string | null): { start: Date | null; end: Date | null } {
  if (!input) return { start: null, end: null };
  const text = String(input).trim();
  const parts = text.split(/~|~|–|-|to|\u223C/).map((s) => s.trim());
  let start: Date | null = null;
  let end: Date | null = null;
  const tryParse = (s?: string | null) => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  if (parts.length >= 1) start = tryParse(parts[0]);
  if (parts.length >= 2) end = tryParse(parts[1]);
  return { start, end };
}

