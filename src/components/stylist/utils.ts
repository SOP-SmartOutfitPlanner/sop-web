"use client";

export const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "0";

export const stripHtml = (value: string) => value.replace(/<[^>]*>?/gm, "");

export const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

