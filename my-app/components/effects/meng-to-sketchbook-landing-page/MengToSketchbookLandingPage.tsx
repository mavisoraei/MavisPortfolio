"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import "./styles.css";

export type MengToSketchbookLandingPageProps = {
  /** The page's own authored display type. */
  headingFont?: "instrument-serif" | "newsreader" | "geist";
  /** The page's own authored body type. */
  bodyFont?: "newsreader" | "geist" | "instrument-serif";
  /** Display weight — the page is authored at 400. */
  headingWeight?: "300" | "400" | "500" | "600";
  /** Body weight — the page is authored at 400. */
  bodyWeight?: "200" | "300" | "400" | "500" | "600";
  /** Hex colour for page ink and its opacity tints; the warm earth accent stays authored. */
  primaryColor?: string;
  /** Nameplate and plate-title scale, in px. */
  headingSize?: number;
  /** Body scale, in px. */
  bodySize?: number;
  /** Nameplate tracking, in em. */
  headingLetterSpacing?: number;
  className?: string;
  style?: CSSProperties;
};

const SOURCE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing-pages/meng-to-sketchbook.html`;

const FONT_STACKS: Record<string, string> = {
  "instrument-serif": '"Instrument Serif", Georgia, "Times New Roman", serif',
  newsreader: '"Newsreader", Georgia, "Times New Roman", serif',
  geist: "Geist, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
};

/* The landing page self-hosts Instrument Serif + Newsreader via @font-face,
   so no Google Fonts stylesheet is ever injected — an external css2 request
   used to fail and stall the riffle's document.fonts.ready handshake. */
function buildCustomizationCss(props: MengToSketchbookLandingPageProps) {
  const heading =
    props.headingFont && FONT_STACKS[props.headingFont]
      ? props.headingFont
      : "instrument-serif";
  const body =
    props.bodyFont && FONT_STACKS[props.bodyFont] ? props.bodyFont : "newsreader";
  const headingWeight = props.headingWeight ?? "400";
  const bodyWeight = props.bodyWeight ?? "400";
  const primary =
    props.primaryColor &&
    /^#([\da-f]{3}|[\da-f]{6})$/i.test(props.primaryColor)
      ? props.primaryColor
      : "#2b2721";

  const headingSize = props.headingSize ?? 30;
  const bodySize = props.bodySize ?? 20;
  const ls = props.headingLetterSpacing ?? 0.01;

  const digitsOf = (hex: string) =>
    hex.length === 4 ? hex.slice(1).replace(/./g, (d) => d + d) : hex.slice(1);

  const withAlpha = (hex: string, alpha: number) => {
    const digits = digitsOf(hex);
    const [r, g, b] = [0, 2, 4].map((i) =>
      Number.parseInt(digits.slice(i, i + 2), 16),
    );
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const n = (v: number) => Number(v.toFixed(3));
  const px = (v: number) => `${n(v)}px`;

  return `
:root {
  --ink: ${primary};
  --ink-soft: ${withAlpha(primary, 0.58)};
  --ink-faint: ${withAlpha(primary, 0.36)};
  --hairline: ${withAlpha(primary, 0.14)};
  --display: ${FONT_STACKS[heading]};
  --font: ${FONT_STACKS[body]};
}
body { font-family: ${FONT_STACKS[body]}; font-weight: ${bodyWeight}; }
.top .name, .plate .t { font-family: ${FONT_STACKS[heading]}; font-weight: ${headingWeight}; }
.top .name {
  font-size: clamp(${px((headingSize * 24) / 30)}, calc(${n(headingSize / 30)} * 2.4vw), ${px(headingSize)});
  letter-spacing: ${ls}em;
}
.plate .t {
  font-size: clamp(${px((headingSize * 19) / 30)}, calc(${n(headingSize / 30)} * 2.1vw), ${px((headingSize * 26) / 30)});
  letter-spacing: ${n(ls - 0.01)}em;
}
.top .menu { font-size: ${px((bodySize * 15) / 20)}; font-weight: ${bodyWeight === "400" ? "300" : bodyWeight}; }
.sb-cats { font-size: ${px((bodySize * 11) / 20)}; }
.sb-caption { font-size: ${px((bodySize * 13) / 20)}; }
.section-label, .zoom-read { font-size: ${px((bodySize * 11) / 20)}; }
.bio {
  font-size: clamp(${px((bodySize * 17) / 20)}, calc(${n(bodySize / 20)} * 1.7vw), ${px(bodySize)});
  font-weight: ${bodyWeight === "400" ? "300" : bodyWeight};
}
.plate .n { font-size: ${px((bodySize * 12) / 20)}; }
.plate .p { font-size: ${px((bodySize * 12.5) / 20)}; }
.foot { font-size: ${px((bodySize * 11.5) / 20)}; }
::selection { background: ${withAlpha(primary, 0.85)}; }
.bio-link { text-decoration-color: ${withAlpha(primary, 0.28)}; }
@media (max-width: 640px) {
  .top .name { font-size: ${px((headingSize * 20) / 30)}; }
  .top .menu { font-size: ${px((bodySize * 12) / 20)}; }
  .sb-cats { font-size: ${px((bodySize * 9.5) / 20)}; }
}
`;
}

function fontHrefFor(_props: MengToSketchbookLandingPageProps) {
  return undefined; /* local @font-face covers all three faces */
}

function applyCustomization(
  frame: HTMLIFrameElement | null,
  values: {
    css: string;
    fontHref?: string;
  },
) {
  const doc = frame?.contentDocument;
  if (!doc?.head) return;
  const head = doc.head;

  const { css, fontHref } = values;
  const existingStyle = doc.getElementById("threeui-page-typography") as HTMLStyleElement | null;
  const style = existingStyle ?? doc.createElement("style");
  style.id = "threeui-page-typography";
  if (style.textContent !== css) style.textContent = css;
  head.appendChild(style);

  const existingLink = doc.getElementById("threeui-page-typography-fonts") as HTMLLinkElement | null;
  if (fontHref) {
    const link = existingLink ?? doc.createElement("link");
    link.id = "threeui-page-typography-fonts";
    link.rel = "stylesheet";
    if (link.getAttribute("href") !== fontHref) link.href = fontHref;
    if (!existingLink) head.append(link);
  } else {
    existingLink?.remove();
  }
}

export function MengToSketchbookLandingPage(props: MengToSketchbookLandingPageProps) {
  const { className = "", style } = props;
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const {
    headingFont,
    bodyFont,
    headingWeight,
    bodyWeight,
    primaryColor,
    headingSize,
    bodySize,
    headingLetterSpacing,
  } = props;

  const apply = useCallback(
    (frame: HTMLIFrameElement | null) =>
      applyCustomization(frame, {
        css: buildCustomizationCss({
          headingFont,
          bodyFont,
          headingWeight,
          bodyWeight,
          primaryColor,
          headingSize,
          bodySize,
          headingLetterSpacing,
        }),
        fontHref: fontHrefFor({ headingFont, bodyFont }),
      }),
    [headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing],
  );

  useEffect(() => {
    apply(frameRef.current);
    // Reveal as soon as the sketchbook document is interactive — its deferred
    // landing.js has by then painted the first page and kicked off the intro
    // riffle. Waiting for the iframe's full `load` (all eager images + defer
    // scripts) would keep the book hidden while the riffle is at its busiest.
    const frame = frameRef.current;
    const frameDocument = frame?.contentDocument;
    if (!frameDocument) return;
    const markReady = () => setReady(true);
    if (frameDocument.readyState === "complete" || frameDocument.readyState === "interactive") {
      markReady();
    } else {
      frameDocument.addEventListener("DOMContentLoaded", markReady);
      return () => frameDocument.removeEventListener("DOMContentLoaded", markReady);
    }
  }, [apply]);

  return (
    <div
      className={`sketchbook-landing-page${className ? ` ${className}` : ""}`}
      data-state={ready ? "ready" : "loading"}
      style={{ position: "relative", overflow: "hidden", background: "#ece7dc", ...style }}
    >
      <iframe
        ref={frameRef}
        title="Adam Fay — Portfolio"
        src={SOURCE_URL}
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="eager"
        onLoad={(event) => {
          apply(event.currentTarget);
          setReady(true);
        }}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "#ece7dc",
          opacity: ready ? 1 : 0,
          transition: "opacity 180ms ease-out",
        }}
      />
    </div>
  );
}
