import { Link } from "wouter";
import { CURRENT_STORE } from "@/lib/store";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = CURRENT_STORE.logo ? (
    <img
      src={CURRENT_STORE.logo}
      alt={CURRENT_STORE.name}
      className={`object-contain select-none cursor-pointer ${className}`}
      style={{ maxWidth: "140px" }}
      data-testid={testId}
    />
  ) : (
    <span
      className={`inline-flex items-center font-extrabold tracking-tight whitespace-nowrap select-none cursor-pointer ${className}`}
      style={{ color: "hsl(var(--primary))", fontSize: "1.35rem", lineHeight: 1 }}
      data-testid={testId}
    >
      {CURRENT_STORE.shortName}
    </span>
  );

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>;
  }
  return logo;
}
