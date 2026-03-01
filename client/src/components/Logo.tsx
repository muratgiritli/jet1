import { Link } from "wouter";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = (
    <img
      src="/logo-jetgo.png"
      alt="JETGO Pet Shop"
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
