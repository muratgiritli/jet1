import { Link } from "wouter";
import { CURRENT_STORE } from "@/lib/store";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = (
    <img
      src={CURRENT_STORE.logo}
      alt={CURRENT_STORE.name}
      className={`object-contain select-none cursor-pointer ${className}`}
      style={{ maxWidth: "140px" }}
      data-testid={testId}
    />
  );

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>;
  }
  return logo;
}
