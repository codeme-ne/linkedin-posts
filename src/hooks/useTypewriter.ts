import { useEffect, useState } from "react";

type Options = {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  enabled?: boolean;
};

export function useTypewriter(
  phrases: string[],
  { typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000, enabled = true }: Options = {}
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!enabled || phrases.length === 0) return;

    const currentPhrase = phrases[currentIndex] ?? "";

    if (!isDeleting && displayText.length < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && displayText.length === currentPhrase.length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }
  }, [displayText, isDeleting, currentIndex, enabled, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return { displayText, currentIndex, isDeleting } as const;
}
