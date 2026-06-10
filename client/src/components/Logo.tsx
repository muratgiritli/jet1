import { Link } from "wouter";
import { CURRENT_STORE } from "@/lib/store";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = CURRENT_STORE.logo ? (
    CURRENT_STORE.logoMobile ? (
      <>
        <img
          src={CURRENT_STORE.logoMobile}
          alt={CURRENT_STORE.name}
          className={`object-contain object-left select-none cursor-pointer md:hidden ${className}`}
          style={{ maxWidth: "150px", maxHeight: "34px" }}
          data-testid={testId}
        />
        <img
          src={CURRENT_STORE.logo}
          alt={CURRENT_STORE.name}
          className={`object-contain object-left select-none cursor-pointer hidden md:block ${className}`}
          style={{ maxWidth: "190px", maxHeight: "46px" }}
          data-testid={`${testId}-desktop`}
        />
      </>
    ) : (
      <img
        src={CURRENT_STORE.logo}
        alt={CURRENT_STORE.name}
        className={`object-contain select-none cursor-pointer ${className}`}
        style={{ maxWidth: "140px", maxHeight: "42px" }}
        data-testid={testId}
      />
    )
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
