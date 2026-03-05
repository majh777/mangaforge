'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  texts?: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  onceTyping?: boolean;
  stopped?: boolean;
}

const DEFAULT_TEXTS = [
  'A wandering samurai in a world where music is magic...',
  'Twin sisters separated at birth discover they have opposing superpowers...',
  'A detective who can taste lies investigates a murder at a cooking competition...',
  'The last dragon hatches in a cyberpunk megacity...',
  'A shy librarian discovers books are portals to the worlds they describe...',
];

export function TypewriterText({
  texts = DEFAULT_TEXTS,
  speed = 50,
  deleteSpeed = 30,
  pauseTime = 2000,
  className = '',
  stopped = false,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (stopped) return;

    const currentText = texts[textIndex];

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, speed);
      } else {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime, stopped]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-violet">|</span>
    </span>
  );
}
