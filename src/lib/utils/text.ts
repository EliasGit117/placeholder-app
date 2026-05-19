
type TTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export function pickFirstLetters(text: string, count: number = 1, transform: TTransform = 'uppercase'): string {
  const picked = text
    .trim()
    .split(/\s+/)
    .slice(0, Math.max(0, count))
    .map(word => word.charAt(0))
    .join('');

  switch (transform) {
    case 'uppercase':
      return picked.toUpperCase();

    case 'lowercase':
      return picked.toLowerCase();

    case 'capitalize':
      return picked.charAt(0).toUpperCase() + picked.slice(1).toLowerCase();

    case 'none':
    default:
      return picked;
  }
}

export function capitalizeFirst<T extends string>(str: T): Capitalize<T> {
  if (!str)
    return str as Capitalize<T>;

  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}