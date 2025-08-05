/**
 * Converts a string to a hyphen-separated, lowercase slug.
 * Removes special characters.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // remove special chars
    .replace(/\s+/g, '-')          // spaces to hyphens
    .replace(/-+/g, '-');          // collapse multiple hyphens
}

/**
 * Creates a short, readable timestamp suffix.
 * Example: 2025-08-05T12:34:56.789Z ➝ "5f8d9c"
 */
function getShortTimestamp(): string {
  return Date.now().toString(36); // base36 encoded timestamp
}

/**
 * Generates a unique slug using the title and a short timestamp.
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const suffix = getShortTimestamp();
  return `${baseSlug}-${suffix}`;
}
