export const HexConverter = (hexString: string) => {
  if (!hexString) return "#0";

  let hash = 0;
  for (let i = 0; i < hexString.length; i++) {
    const char = hexString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const positiveHash = Math.abs(hash);
  const maxValue = Math.pow(10, 6) - 1;
  const value = positiveHash % maxValue;
  return `#${value}`;
};
