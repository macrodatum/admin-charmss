export const truncateAssetName = (name: string, max = 50): string => {
  if (!name) return name;
  if (name.length <= max) return name;

  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0) {
    const ext = name.slice(lastDot); // includes the dot
    const base = name.slice(0, lastDot);

    // If extension alone is longer than max, just cut the full name to max
    if (ext.length >= max) {
      return name.slice(0, max);
    }

    const maxBase = Math.max(0, max - ext.length);
    return base.slice(0, maxBase) + ext;
  }

  // No extension, simple cut
  return name.slice(0, max);
};
