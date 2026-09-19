'use client';
import { IconInfo } from './icons';

// A small "i" that explains a term twice over: hover for a one-line popover,
// click to open the assistant pre-loaded with the question (chat-first help).
export default function InfoDot({ text, question }) {
  return (
    <button
      type="button"
      className="info-dot"
      aria-label={question ? `Assistant: ${question}` : 'Explain this'}
      title="Ask the assistant"
      onClick={(e) => {
        e.stopPropagation();
        window.dispatchEvent(
          new CustomEvent('pulseguard:ask', {
            detail: { question: question || `Can you explain this? ${text}` },
          })
        );
      }}
    >
      <IconInfo size={13} />
      <span className="info-pop">{text}</span>
    </button>
  );
}
