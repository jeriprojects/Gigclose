import { ReactNode } from "react";

export const PageHero = ({
  eyebrow,
  title,
  description,
  actions,
  side,
  align = "left",
  className = "",
  style,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  side?: ReactNode;
  align?: "left" | "center";
  className?: string;
  style?: React.CSSProperties;
}) => {
  const isCenter = align === "center";
  return (
    <section className={`gig-page-hero p-6 sm:p-9 lg:p-12 ${className}`} style={style}>
      <div
        className={`grid gap-8 ${side ? "lg:grid-cols-[1.2fr,0.8fr] lg:items-end" : ""}`}
      >
        <div className={isCenter ? "mx-auto max-w-3xl text-center" : ""}>
          {eyebrow && <p className="gig-eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className={`mt-4 max-w-2xl text-base leading-8 text-muted-foreground ${isCenter ? "mx-auto" : ""}`}>
              {description}
            </p>
          )}
          {actions && (
            <div className={`mt-6 flex flex-wrap gap-3 ${isCenter ? "justify-center" : ""}`}>
              {actions}
            </div>
          )}
        </div>
        {side && <div>{side}</div>}
      </div>
    </section>
  );
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) => (
  <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
    {eyebrow && <p className="gig-eyebrow">{eyebrow}</p>}
    <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{title}</h2>
    {description && <p className="mt-3 text-muted-foreground leading-7">{description}</p>}
  </div>
);
