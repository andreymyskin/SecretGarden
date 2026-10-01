type Props = { name: string; className?: string };

/** Thin-line icons for the hero strengths list. */
export function StrengthIcon({ name, className = "h-6 w-6" }: Props) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.2-2h6l1.2 2h2.3A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 20V9.5L12 4l8 5.5V20" />
          <path d="M4 20h16" />
          <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
          <path d="M8 11.5h.01M12 10.5h.01M16 11.5h.01" />
        </svg>
      );
    case "piano":
      return (
        <svg {...common}>
          <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V18H4z" />
          <path d="M4 12h16" />
          <path d="M7.2 12v3.5M10.4 12v3.5M13.6 12v3.5M16.8 12v3.5" />
          <path d="M6 18v1.5M18 18v1.5" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M12 21s-6-5.2-6-10.5a6 6 0 0 1 12 0C18 15.8 12 21 12 21z" />
          <circle cx="12" cy="10.5" r="2.2" />
        </svg>
      );
    case "dress":
      return (
        <svg {...common}>
          <path d="M9 3.5c0 2 1.3 3 3 3s3-1 3-3" />
          <path d="M9.5 6.5 8 11l-3.5 8.5h15L16 11l-1.5-4.5" />
          <path d="M8 11h8" />
        </svg>
      );
    case "price":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.5 16.5v-9h3.3a2.6 2.6 0 0 1 0 5.2H9.5" />
          <path d="M8.5 15h4.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.3 2.3 4.7-4.6" />
        </svg>
      );
  }
}
