import type { CSSProperties } from "react";

/** Co-located styles for FindingsPanel (extracted from inline styles). */
export const s = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  } satisfies CSSProperties,
  divider: {
    width: 1,
    height: 18,
    background: "var(--border)",
    margin: "0 2px",
  } satisfies CSSProperties,
  toggleGroup: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--text-secondary)",
  } satisfies CSSProperties,
  counters: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  } satisfies CSSProperties,
  counterSep: { color: "var(--text-muted)" } satisfies CSSProperties,
  counter: (color: string, bg: string, active: boolean, dimmed: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    color: dimmed ? "var(--text-muted)" : color,
    background: active ? bg : "transparent",
    border: `1px solid ${active ? color : "transparent"}`,
    opacity: dimmed ? 0.55 : 1,
  }),
  list: { display: "flex", flexDirection: "column", gap: 12 } satisfies CSSProperties,
} as const;
