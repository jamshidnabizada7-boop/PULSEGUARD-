'use client';
import { IconInfo } from './icons';

// A small "i" that reveals one plain-English sentence on hover/focus.
// Use it wherever a technical term must stay on screen but shouldn't confuse.
export default function InfoDot({ text }) {
  return (
    <span className="info-dot" tabIndex={0} role="note" aria-label={text}>
      <IconInfo size={13} />
      <span className="info-pop">{text}</span>
    </span>
  );
}
