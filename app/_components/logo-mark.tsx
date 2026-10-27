// GrantDesk mark: an open book with a check mark, drawn on a 24×24 grid.
// apple-icon.tsx reuses these paths; app/icon.svg is a static file and keeps its own copy.
export const LOGO_PATHS = [
  "M12 11.5C10 10 7 9.6 3 10v10c4-.4 7 0 9 1.5",
  "M12 11.5c2-1.5 5-1.9 9-1.5v10c-4-.4-7 0-9 1.5",
  "M12 11.5v10",
  "m8 5 3 3 5.5-5.5",
] as const;

export function LogoMark({ className }: { readonly className?: string }) {
  return (
    // Decorative: the word "GrantDesk" always sits beside it.
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {LOGO_PATHS.map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
