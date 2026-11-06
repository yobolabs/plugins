import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Word-synced captions. Words come from Whisper word timestamps (seconds).
// single = one big word at a time; phrase = 2-3 words, spoken word in accent.
export type CaptionWord = { text: string; start: number; end: number };
export type WordCaptionsProps = {
  words: CaptionWord[];
  mode: "single" | "phrase";
  variant?: "shadow" | "pill";
  brand: { font: string; accent: string };
  y?: number; // vertical centre, 0-1 of height (default 0.63 single / 0.61 phrase)
  maxWords?: number; // phrase group size, 2-3
  pauseBreak?: number; // seconds; a gap longer than this ends a line
  popIn?: boolean;
};

type Group = { words: CaptionWord[]; from: number; to: number };

const PUNCT = /[.,!?;:…]$/;

export const groupWords = (
  words: CaptionWord[],
  mode: "single" | "phrase",
  fps: number,
  maxWords = 3,
  pauseBreak = 0.35,
): Group[] => {
  const groups: CaptionWord[][] = [];
  let cur: CaptionWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const pause = next ? next.start - w.end : Infinity;
    const full = mode === "single" ? true : cur.length >= maxWords;
    if (full || PUNCT.test(w.text) || pause > pauseBreak || !next) {
      groups.push(cur);
      cur = [];
    }
  });
  const hold = 6 / fps;
  return groups.map((g, i) => {
    const last = g[g.length - 1];
    const next = groups[i + 1];
    // No gaps inside a line: hold to the next group's start. At a line end
    // (pause > pauseBreak or last group) hold to the word's end + 6 frames.
    const gap = next ? next[0].start - last.end : Infinity;
    const to = gap > pauseBreak ? last.end + hold : next[0].start;
    return { words: g, from: g[0].start, to };
  });
};

export const WordCaptions: React.FC<WordCaptionsProps> = ({
  words,
  mode,
  variant = "shadow",
  brand,
  y,
  maxWords = 3,
  pauseBreak = 0.35,
  popIn = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const groups = groupWords(words, mode, fps, maxWords, pauseBreak);
  const g = groups.find((x) => t >= x.from && t < x.to);
  if (!g) return null;

  const startFrame = Math.round(g.from * fps);
  const scale = popIn
    ? 0.85 + 0.15 * spring({ frame: frame - startFrame, fps, config: { damping: 200 }, durationInFrames: 4 })
    : 1;
  const yc = y ?? (mode === "single" ? 0.63 : 0.61);
  const fontSize = mode === "single" ? height * 0.073 : height * 0.032;
  const shadow = variant === "shadow";

  return (
    <AbsoluteFill style={{ fontFamily: brand.font }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * yc,
          transform: `translateY(-50%) scale(${scale})`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "82%",
            textAlign: "center",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize,
            lineHeight: 1.15,
            textShadow: shadow ? "0 4px 12px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.8)" : undefined,
            background: shadow ? undefined : "rgba(26,26,26,0.65)",
            padding: shadow ? 0 : `${height * 0.012}px ${height * 0.028}px`,
            borderRadius: shadow ? 0 : height * 0.014,
          }}
        >
          {g.words.map((w, i) => {
            // Hard cut on the word's start frame; the active word holds until the next starts.
            const nextStart = g.words[i + 1]?.start ?? Infinity;
            const active = mode === "phrase" && t >= w.start && t < nextStart;
            return (
              <span key={i} style={{ color: active ? brand.accent : "#FFFFFF" }}>
                {w.text}
                {i < g.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
