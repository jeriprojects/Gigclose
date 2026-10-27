import { useEffect, useState } from "react";

export const TypingText = ({
  text,
  className,
  speed = 28,
}: {
  text: string;
  className?: string;
  speed?: number;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [speed, text]);

  return (
    <span className={className}>
      {text.slice(0, index)}
      <span className="typing-caret">|</span>
    </span>
  );
};
