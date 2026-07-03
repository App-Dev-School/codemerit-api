/**
 * Converts a string to a hyphen-separated, lowercase slug.
 * Removes special characters.
 */
export function generateSlug(title: string, maxLen = 40): string {
  const trimmedTitle = title.length > maxLen ? title.slice(0, maxLen) : title;
  return trimmedTitle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Creates a short, readable timestamp suffix.
 * Example: 2025-08-05T12:34:56.789Z ➝ "5f8d9c"
 */
function getShortSuffix(length = 4): string {
  const src = Date.now().toString(36) + Math.random().toString(36).slice(2);
  return src.slice(-length);
}

/**
 * Generates a unique username-like slug guaranteed to fit within `maxLen`.
 * - `title` is sanitized and used as the base
 * - `maxLen` defaults to 20 (database username limit)
 * - `suffixLength` controls the short unique suffix length (default 4)
 *
 * Example: "vishal-kumar" -> "vishal-kumar-1a2b"
 */
export function generateUniqueSlug(title: string, maxLen = 20, suffixLength = 4): string {
  const sep = '-';
  const clean = generateSlug(title, 100); // sanitize without aggressive truncation
  const suffix = getShortSuffix(suffixLength);

  const maxBaseLen = Math.max(1, maxLen - suffixLength - sep.length);
  let base = generateSlug(clean, maxBaseLen);
  if (!base) base = 'u';

  // Ensure no trailing separator before appending suffix
  base = base.replace(new RegExp(`${sep}+$`), '');

  const username = `${base}${sep}${suffix}`;
  return username.slice(0, maxLen);
}
