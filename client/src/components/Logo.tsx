import { Link } from "wouter";

interface LogoProps {
  className?: string;
  linkTo?: string;
  testId?: string;
}

export default function Logo({ className = "h-8", linkTo = "/", testId = "img-brand-logo" }: LogoProps) {
  const logo = (
    <span
      className={`inline-flex items-center font-black tracking-tight text-white select-none cursor-pointer ${className}`}
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif", lineHeight: 1 }}
      data-testid={testId}
    >
      <span style={{ fontSize: "inherit" }}>JET</span>
      <span style={{ color: "#ffd54f", fontSize: "inherit" }}>GO</span>
    </span>
  );

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>;
  }
  return logo;
}
