"use client";

import { useMemo, type CSSProperties } from "react";

type GlowingTextProps = {
  eyebrow?: string;
  text?: string;
  textColor?: string;
  glowColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  glowIntensity?: number;
  characterStagger?: number;
  revealDuration?: number;
  lineGap?: number;
  className?: string;
};

type CharStyle = CSSProperties & {
  "--char-delay": string;
  "--char-duration": string;
};

type Token = { text: string; isSpace: boolean; start: number };

const START_DELAY = 0.2;

function withAlpha(color: string, alpha: number) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  return color;
}

function tokenizeWithOffsets(value: string): Token[] {
  const matches = value.match(/\s+|\S+/g) ?? [];
  let offset = 0;

  return matches.map((text) => {
    const start = offset;
    offset += Array.from(text).length;
    return { text, isSpace: /^\s/.test(text), start };
  });
}

function computeLineCharDelays(
  lineTokens: Token[][],
  stagger: number,
  duration: number,
  lineGap: number,
): number[][] {
  let elapsed = START_DELAY;

  return lineTokens.map((tokens) => {
    const charCount = tokens.reduce((total, token) => total + Array.from(token.text).length, 0);
    const delays = Array.from({ length: charCount }, (_, index) => elapsed + index * stagger);
    const lineDuration = charCount > 0 ? (charCount - 1) * stagger + duration : 0;
    elapsed += lineDuration + Math.max(lineGap, 0);
    return delays;
  });
}

export default function GlowingText({
  eyebrow = "",
  text = "",
  textColor = "#d8d8d8",
  glowColor = "#ffffff",
  backgroundColor = "transparent",
  fontSize = 1.6,
  letterSpacing = 0.02,
  lineHeight = 1.7,
  glowIntensity = 0.7,
  characterStagger = 0.02,
  revealDuration = 0.5,
  lineGap = 0.15,
  className = "",
}: GlowingTextProps) {
  const glowSoft = withAlpha(glowColor, Math.min(0.48, glowIntensity * 0.48));
  const glowHard = withAlpha(glowColor, Math.min(0.9, glowIntensity * 0.9));
  const dimEnd = withAlpha(textColor, 0.85);
  const stagger = Math.max(characterStagger, 0.01);
  const duration = Math.max(revealDuration, 0.1);

  const eyebrowTokens = useMemo(() => tokenizeWithOffsets(eyebrow), [eyebrow]);
  const lineTokens = useMemo(() => text.split("\n").map(tokenizeWithOffsets), [text]);

  const lineCharDelays = useMemo(
    () => computeLineCharDelays(lineTokens, stagger, duration, lineGap),
    [lineTokens, stagger, duration, lineGap],
  );

  const renderTokens = (tokens: Token[], keyPrefix: string, delayFor: (charIndex: number) => number) =>
    tokens.map((token, tokenIndex) => {
      if (token.isSpace) {
        return <span key={`${keyPrefix}-space-${tokenIndex}`}>{token.text}</span>;
      }

      return (
        <span key={`${keyPrefix}-word-${tokenIndex}`} className="glowing-text-word">
          {Array.from(token.text).map((character, charIndex) => (
            <span
              key={`${keyPrefix}-char-${tokenIndex}-${charIndex}`}
              aria-hidden="true"
              className="glowing-text-char"
              style={
                {
                  "--char-delay": `${delayFor(token.start + charIndex)}s`,
                  "--char-duration": `${duration}s`,
                } as CharStyle
              }
            >
              {character}
            </span>
          ))}
        </span>
      );
    });

  return (
    <section
      className={`glowing-text-root relative flex w-full flex-col justify-center px-4 py-8 ${className}`}
      style={
        {
          "--glow-text": textColor,
          "--glow-text-dim-end": dimEnd,
          "--glow-soft": glowSoft,
          "--glow-hard": glowHard,
          "--glow-settled-weight": 300,
          backgroundColor,
        } as CSSProperties
      }
    >
      <div className="relative z-10 mx-auto w-full max-w-[650px]">
        {eyebrow && (
          <div
            className="glowing-text-eyebrow mb-6 font-mono uppercase"
            style={{
              fontSize: `clamp(0.9rem, ${fontSize * 0.52}vw, 1.8rem)`,
              letterSpacing: `${letterSpacing + 0.15}em`,
            }}
          >
            {renderTokens(eyebrowTokens, "eyebrow", (charIndex) => START_DELAY + charIndex * stagger)}
          </div>
        )}

        <div
          className="glowing-text-copy"
          style={{
            fontSize: `clamp(1rem, ${fontSize}vw, 1.15rem)`,
            letterSpacing: `${letterSpacing}em`,
            lineHeight,
            fontFamily: 'Georgia, "Times New Roman", serif',
            textAlign: "left",
            background: "transparent",
          }}
        >
          {lineTokens.map((tokens, lineIndex) => (
            <div key={`line-${lineIndex}`} className="glowing-text-line mb-6">
              {renderTokens(tokens, `line-${lineIndex}`, (charIndex) => lineCharDelays[lineIndex][charIndex])}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .glowing-text-root { color: var(--glow-text); }
        .glowing-text-word { display: inline-block; }
        .glowing-text-char {
          display: inline-block;
          color: var(--glow-text);
          opacity: 0;
          font-weight: var(--glow-settled-weight);
          animation: glowing-char-reveal var(--char-duration) ease-out var(--char-delay) forwards;
        }

        @keyframes glowing-char-reveal {
          0% {
            color: var(--glow-text);
            opacity: 0;
            text-shadow: none;
          }
          55% {
            color: var(--glow-text);
            opacity: 1;
            text-shadow: 0 0 7px var(--glow-hard), 0 0 18px var(--glow-hard), 0 0 34px var(--glow-hard);
          }
          100% {
            color: var(--glow-text-dim-end);
            opacity: 0.92;
            text-shadow: none;
          }
        }
      `}</style>
    </section>
  );
}