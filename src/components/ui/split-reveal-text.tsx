import { cn } from "@/lib/utils";

export const SplitRevealText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <span className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
    {text.split(" ").map((word, index) => (
      <span
        key={`${word}-${index}`}
        className="split-word"
        style={{ animationDelay: `${index * 70}ms` }}
      >
        {word}
      </span>
    ))}
  </span>
);
