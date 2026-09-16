import type { DifficultyFactor } from "./midi";

/** One row of `pieces`. Column names match the SQL in `supabase/schema.sql`. */
export type Piece = {
  id: string;
  created_at: string;
  title: string;
  composer: string | null;
  source_filename: string;
  storage_path: string;
  file_size_bytes: number;
  checksum: string;
  duration_seconds: number;
  tempo_bpm: number | null;
  time_signature: string | null;
  key_signature: string | null;
  key_is_estimated: boolean;
  note_count: number;
  lowest_note: number;
  highest_note: number;
  distinct_pitch_count: number;
  max_simultaneous_notes: number;
  notes_per_second: number;
  black_key_fraction: number;
  track_count: number;
  two_hands: boolean;
  two_hands_basis: string;
  difficulty: number;
  difficulty_factors: DifficultyFactor[];
  /** [start, pitch, length, hand?] — hand 0 left, 1 right; absent on older rows. */
  pitch_map: [number, number, number, number?][];
  /** The user's own words about the piece. Nothing measures this. */
  notes: string | null;
  in_progress: boolean;
  is_favourite: boolean;
  last_practiced_at: string | null;
  practice_seconds: number;
  session_count: number;
};

/* -------------------------------------------------------------------------- *
 * Translate, don't transcribe.
 *
 * Every musical fact this app shows is paired with what it actually means for
 * someone who may never have read a note. A number on its own is a fact a
 * beginner has to already understand; a number plus its meaning is a thing they
 * can use tonight.
 * -------------------------------------------------------------------------- */

/**
 * How hard, in a word somebody would actually say. No codes, no invented
 * taxonomy — the previous build made people learn "ZONE A-03" before they could
 * read their own library, and that was the whole problem with it.
 */
export const LEVELS = [
  { level: 1, name: "Easy", blurb: "One hand, notes close together, nothing fast." },
  { level: 2, name: "Fairly easy", blurb: "Both hands, but they mostly stay put." },
  { level: 3, name: "Tricky", blurb: "Your hands move around and both stay busy." },
  { level: 4, name: "Hard", blurb: "Fast, wide, and busy. Expect to slow it right down." },
  { level: 5, name: "Very hard", blurb: "A great many notes, a long way apart, quickly." },
] as const;

export function level(value: number) {
  return LEVELS[Math.min(5, Math.max(1, Math.round(value))) - 1];
}

/**
 * The one line every song leads with, the way a recipe leads with
 * "serves 4 · 25 minutes · easy".
 */
export function summaryLine(piece: Piece): string {
  return summaryParts(piece).join("  ·  ");
}

/**
 * The same summary split at its separators, so a narrow card can break between
 * facts but never inside one — "Both / hands" is not a phrase.
 */
export function summaryParts(piece: Piece): string[] {
  // Difficulty first: it is the question a learner actually filters on.
  // "Both hands" used to sit here and was true of every song in the library —
  // a fact that never varies earns no space. The note picture shows it instead.
  return [level(piece.difficulty).name, durationRough(piece.duration_seconds)];
}

/**
 * Three plain steps, written from what the file actually measures. This is the
 * part that makes the card a recipe rather than a label: it tells you what to
 * do, not only what the piece is.
 */
export function howToStart(piece: Piece): string[] {
  const steps: string[] = [];
  const factor = (key: string) => piece.difficulty_factors.find((f) => f.key === key)?.weight ?? 0;

  const independence = factor("independence");
  if (!piece.two_hands) {
    steps.push(
      "Everything here sits under one hand, so you can start playing straight away without splitting it up.",
    );
  } else if (independence > 0.5) {
    steps.push(
      "Both hands are busy the whole way through, so learn them completely separately before you try them together. That is the part that takes the time.",
    );
  } else if (independence > 0.22) {
    steps.push(
      "Your left hand is doing real work here, not just holding chords. Play it on its own a few times until it runs without you watching it.",
    );
  } else {
    steps.push(
      "Your left hand mostly holds chords while the right hand carries the tune, so learn the right hand first and add the left underneath it.",
    );
  }

  if (piece.tempo_bpm && factor("speed") > 0.35) {
    steps.push(
      `Start slowly, around ${Math.round(piece.tempo_bpm / 2)} beats a minute instead of ${piece.tempo_bpm}. Speed up only once you stop making mistakes.`,
    );
  } else if (piece.tempo_bpm) {
    steps.push(
      `At ${piece.tempo_bpm} beats a minute this is ${tempoInWords(piece.tempo_bpm)}, so you can take it close to full speed while you learn it.`,
    );
  }

  if (factor("reach") > 0.45) {
    steps.push(
      `Your hands reach across ${reachInWords(piece.lowest_note, piece.highest_note)}. Find the places where they have to jump and practise just those moves before playing it through.`,
    );
  } else if (piece.black_key_fraction > 0.2) {
    steps.push(
      `About ${Math.round(piece.black_key_fraction * 100)} in every 100 notes are black keys. Your fingers will be up among the black keys a lot, so play slowly enough to feel where they are before you speed up.`,
    );
  } else if (piece.max_simultaneous_notes >= 3) {
    steps.push(
      "There are chords in here. Find each chord shape and hold it a few times on its own before trying to play in time.",
    );
  } else {
    steps.push(
      "Play it through slowly from beginning to end rather than drilling one bar. It is short enough to hold in your head.",
    );
  }

  return steps.slice(0, 3);
}

/**
 * Where the .mid actually lives — Supabase storage when configured, the bundled
 * seed folder when not. Both the download link and the audio preview use it.
 */
export function fileUrl(piece: Piece): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/midi/${piece.storage_path}`
    : `/${piece.storage_path}`;
}

/**
 * How long, roughly. On a card a learner wants "about two minutes", not
 * "1 minute 51 seconds" — the exact figure is in the full card.
 */
export function durationRough(seconds: number): string {
  if (seconds < 50) return "Under a minute";
  if (seconds < 80) return "About a minute";
  if (seconds < 110) return "About 1½ minutes";
  return `About ${Math.round(seconds / 60)} minutes`;
}

/** "3:04" */
export function duration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** "2 minutes 41 seconds" — for screen readers and the detail sheet. */
export function durationInWords(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs} second${secs === 1 ? "" : "s"}`;
  const m = `${mins} minute${mins === 1 ? "" : "s"}`;
  return secs === 0 ? m : `${m} ${secs} second${secs === 1 ? "" : "s"}`;
}

export function tempoInWords(bpm: number | null): string {
  if (bpm === null) return "not written into the file";
  if (bpm <= 55) return "very slow";
  if (bpm <= 72) return "slower than walking";
  if (bpm <= 100) return "about walking pace";
  if (bpm <= 132) return "brisk";
  if (bpm <= 168) return "fast";
  return "very fast";
}

export function timeSignatureInWords(sig: string | null): string {
  if (!sig) return "not written into the file";
  switch (sig) {
    case "4/4":
      return "four beats in a bar, the most common count of all";
    case "3/4":
      return "three beats in a bar, the count you waltz to";
    case "2/4":
      return "two beats in a bar, a march count";
    case "6/8":
      return "two big beats, each with three inside it, a rolling count";
    case "2/2":
      return "two slow beats in a bar";
    case "12/8":
      return "four big beats, each with three inside it";
    default:
      return `${sig.split("/")[0]} beats in a bar`;
  }
}

const SHARP_ORDER = ["F♯", "C♯", "G♯", "D♯", "A♯", "E♯"];
const FLAT_ORDER = ["B♭", "E♭", "A♭", "D♭", "G♭", "C♭"];

const SHARPS_IN_KEY: Record<string, number> = {
  "C major": 0, "G major": 1, "D major": 2, "A major": 3, "E major": 4, "B major": 5, "F♯ major": 6,
  "A minor": 0, "E minor": 1, "B minor": 2, "F♯ minor": 3, "C♯ minor": 4, "G♯ minor": 5, "D♯ minor": 6,
};

const FLATS_IN_KEY: Record<string, number> = {
  "F major": 1, "B♭ major": 2, "E♭ major": 3, "A♭ major": 4, "D♭ major": 5, "G♭ major": 6,
  "D minor": 1, "G minor": 2, "C minor": 3, "F minor": 4, "B♭ minor": 5, "E♭ minor": 6,
};

/** Tone.js writes "Bb"/"F#"; the interface writes "B♭"/"F♯". */
export function normaliseKey(key: string | null): string | null {
  if (!key) return null;
  return key
    .replace(/b\b/g, "♭")
    .replace(/#/g, "♯")
    .replace(/\bmajor\b/i, "major")
    .replace(/\bminor\b/i, "minor")
    .trim();
}

/**
 * The whole point of this function: "E♭ major" means nothing to a beginner, but
 * "three black keys to remember" is something they can act on.
 */
export function keyInWords(key: string | null): string {
  const normalised = normaliseKey(key);
  if (!normalised) return "not written into the file";

  const sharps = SHARPS_IN_KEY[normalised];
  const flats = FLATS_IN_KEY[normalised];

  if (sharps === 0) return "no sharps or flats, every note is a white key";
  if (sharps !== undefined) {
    return `${count(sharps)} sharp${sharps === 1 ? "" : "s"} (${SHARP_ORDER.slice(0, sharps).join(", ")}), so ${count(sharps)} black key${sharps === 1 ? "" : "s"} to remember`;
  }
  if (flats !== undefined) {
    return `${count(flats)} flat${flats === 1 ? "" : "s"} (${FLAT_ORDER.slice(0, flats).join(", ")}), so ${count(flats)} black key${flats === 1 ? "" : "s"} to remember`;
  }
  return "an unusual key, so expect a few black keys";
}

function count(n: number): string {
  return ["no", "one", "two", "three", "four", "five", "six"][n] ?? String(n);
}

export function rangeInWords(lowest: number, highest: number): string {
  const keys = highest - lowest + 1;
  const below = lowest < 55;
  const above = highest > 67;
  const reach =
    keys < 15
      ? "a small patch of the keyboard, so your hands barely move"
      : keys < 26
        ? "a comfortable stretch, your hands stay roughly where they start"
        : keys < 40
          ? "a wide stretch, so your hands travel a fair way"
          : "most of the keyboard, so your hands move a long way";
  const around =
    below && above
      ? " It reaches both below middle C and well above it."
      : above
        ? " It all sits above middle C."
        : below
          ? " It all sits below middle C."
          : "";
  return `${keys} of the 88 keys, ${reach}.${around}`;
}

/** "a third of the keyboard" — never "three octaves". */
export function reachInWords(lowest: number, highest: number): string {
  const share = (highest - lowest + 1) / 88;
  if (share < 0.18) return "a small part of the keyboard";
  if (share < 0.28) return "about a quarter of the keyboard";
  if (share < 0.38) return "about a third of the keyboard";
  if (share < 0.55) return "close to half the keyboard";
  if (share < 0.72) return "well over half the keyboard";
  return "most of the keyboard";
}

/** "yesterday", "3 days ago", "not yet" */
export function lastPractised(iso: string | null): string {
  if (!iso) return "not yet";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 61) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function practiceTime(seconds: number): string {
  if (seconds < 60) return "under a minute";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/* -------------------------------------------------------------------------- *
 * Three ways in, for the days you open the book without a plan.
 *
 * Every pick is a row the catalogue already has, and every reason is the fact
 * that chose it — same rule as the difficulty score. Nothing is recommended
 * here that cannot say, in one line, why it is being recommended.
 * -------------------------------------------------------------------------- */

export type Suggestion = { piece: Piece; label: string; reason: string };

export function suggestions(pieces: Piece[], skip?: string | null): Suggestion[] {
  const pool = pieces.filter((p) => p.id !== skip);
  const taken = new Set<string>();
  const out: Suggestion[] = [];

  const pick = (label: string, reason: (p: Piece) => string, ranked: Piece[]) => {
    const piece = ranked.find((p) => !taken.has(p.id));
    if (!piece) return;
    taken.add(piece.id);
    out.push({ piece, label, reason: reason(piece) });
  };

  // Longest since you played it. The one thing a library is worst at is
  // reminding you of what you have stopped noticing.
  pick(
    "Left the longest",
    (p) => `You last played this ${lastPractised(p.last_practiced_at)}.`,
    pool
      .filter((p) => p.last_practiced_at)
      .sort((a, b) => Date.parse(a.last_practiced_at!) - Date.parse(b.last_practiced_at!)),
  );

  // Added and never opened — a different kind of neglect, so it gets its own slot.
  pick(
    "Never started",
    () => "It has been in your book since you added it and you have not played a note of it.",
    pool
      .filter((p) => !p.last_practiced_at)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)),
  );

  // For the evening where the honest amount of time available is ten minutes.
  pick(
    "If you only have a few minutes",
    (p) =>
      `${durationRough(p.duration_seconds)}, and ${level(p.difficulty).name.toLowerCase()} — a whole piece in one sitting.`,
    [...pool].sort(
      (a, b) => a.duration_seconds - b.duration_seconds || a.difficulty - b.difficulty,
    ),
  );

  return out;
}

/* -------------------------------------------------------------------------- *
 * Finding one song again.
 *
 * The catalogue writes "Für Elise" and "Gymnopédie" because those are the
 * titles. Nobody types them that way — they type "fur elise", which is also
 * what the filename said. Matching the accents literally meant the one piece
 * everybody tries first could not be found at all.
 * -------------------------------------------------------------------------- */

/** "Für" → "fur". Decompose, drop the marks, lowercase. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Every word you typed has to appear somewhere in the piece, in any order and
 * across any of its names — so "bach minuet" finds the minuet, and the
 * filename you downloaded still works as a search term months later.
 */
export function matches(piece: Piece, query: string): boolean {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = fold(
    [piece.title, piece.composer ?? "", piece.source_filename.replace(/[-_.]+/g, " ")].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

/**
 * "Last played 3 days ago", or "Not played yet" — never "Last played not yet",
 * which is what pasting lastPractised() into a sentence produced on the one
 * card the page leads with. Both callers route through here.
 */
export function lastPlayedLine(iso: string | null): string {
  return iso ? `Last played ${lastPractised(iso)}` : "Not played yet";
}
