import logo from "@/assets/Gigclosenewlogo-removebg-preview.png";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  closeClassName?: string;
}

export const Logo = ({

  showWordmark = false,
  wordmarkClassName = "text-foreground",
  closeClassName = "text-primary",
}: LogoProps) => (
  <div className="flex items-center gap-2">
    <img src={logo} alt="Gigsclose logo" style={{ height: 60, width: "auto" }} className="shrink-0 object-contain" />
    {showWordmark && (
      <span className={`whitespace-nowrap font-brand text-base font-bold tracking-tight sm:text-lg ${wordmarkClassName}`}>
        Gigs<span className={closeClassName}>close</span>
      </span>
    )}
  </div>
);
