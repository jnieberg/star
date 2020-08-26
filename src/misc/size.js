export function toSize(size) {
  return `${Math.round(size * 1000000).toLocaleString('en-US')}km`;
}

export function toSizeString(size) {
  if (size < 1) return 'Dwarf';
  if (size < 3) return 'Star';
  if (size < 4) return 'Giant';
  if (size < 4.5) return 'Supergiant';
  return 'Hypergiant';
}
