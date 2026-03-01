import { Link } from "wouter";
import logoImg from "@assets/logo_jetgo_1772397318337.png";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = (
    <img
      src={logoImg}
      alt="JETGO Pet Shop"
      className={`object-contain select-none cursor-pointer ${className}`}
      data-testid={testId}
    />
  );

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>;
  }
  return logo;
}
