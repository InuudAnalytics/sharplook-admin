export const DateTimeConverter = (
  isoDate: string,
  format: "long" | "short" | "medium" = "long"
) => {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  const options = {
    long: {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    },
    short: {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
    },
    medium: {
      year: "numeric" as const,
      month: "long" as const,
      day: "2-digit" as const,
    },
  };

  // Format date part
  const datePart = date.toLocaleDateString(
    "en-US",
    options[format] || options.long
  );

  // Format time part
  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase(); // makes 'PM' → 'pm'

  return `${datePart} ${timePart}`;
};
