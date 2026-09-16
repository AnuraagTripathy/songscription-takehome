import { test } from "node:test";
import assert from "node:assert/strict";
import { matches, suggestions, type Piece } from "./piece.ts";

/**
 * The shelf picks three songs for you, which makes it the one place in this app
 * that decides something on the user's behalf. So it has to stay honest: never
 * the piece already on the desk, never the same piece twice, and each reason
 * has to be true of the piece it is printed under.
 *
 *   npm test
 */

const day = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * day).toISOString();

let n = 0;
function piece(over: Partial<Piece>): Piece {
  return {
    id: `p${++n}`,
    created_at: ago(30),
    title: `Song ${n}`,
    composer: null,
    source_filename: "x.mid",
    storage_path: "x.mid",
    file_size_bytes: 100,
    checksum: String(n),
    duration_seconds: 120,
    tempo_bpm: 100,
    time_signature: "4/4",
    key_signature: "C major",
    key_is_estimated: false,
    note_count: 100,
    lowest_note: 50,
    highest_note: 80,
    distinct_pitch_count: 20,
    max_simultaneous_notes: 3,
    notes_per_second: 2,
    black_key_fraction: 0.1,
    track_count: 2,
    two_hands: true,
    two_hands_basis: "separate tracks",
    difficulty: 3,
    difficulty_factors: [],
    pitch_map: [],
    notes: null,
    in_progress: false,
    is_favourite: false,
    last_practiced_at: ago(5),
    practice_seconds: 0,
    session_count: 0,
    ...over,
  };
}

test("each slot picks the piece it claims to", () => {
  const stale = piece({ title: "Stale", last_practiced_at: ago(90) });
  const recent = piece({ title: "Recent", last_practiced_at: ago(1) });
  const untouched = piece({ title: "Untouched", last_practiced_at: null, created_at: ago(200) });
  const short = piece({ title: "Short", duration_seconds: 30 });

  const picks = suggestions([recent, stale, untouched, short]);

  assert.equal(picks.length, 3);
  assert.equal(picks[0].piece.title, "Stale");
  assert.equal(picks[1].piece.title, "Untouched");
  assert.equal(picks[2].piece.title, "Short");
});

test("the piece already on the desk is never suggested back to you", () => {
  const onTheDesk = piece({ title: "On the desk", last_practiced_at: ago(400) });
  const other = piece({ title: "Other", last_practiced_at: ago(10) });

  const picks = suggestions([onTheDesk, other], onTheDesk.id);
  assert.ok(
    picks.every((p) => p.piece.id !== onTheDesk.id),
    "the featured piece would otherwise win 'left the longest' every time",
  );
});

test("no piece fills two slots", () => {
  // One song, and it is simultaneously the stalest and the shortest.
  const only = piece({ title: "Only", last_practiced_at: ago(50), duration_seconds: 20 });
  const picks = suggestions([only]);

  assert.equal(picks.length, 1);
  assert.equal(new Set(picks.map((p) => p.piece.id)).size, picks.length);
});

test("a slot with nothing in it is dropped, not filled with a wrong reason", () => {
  // Everything has been played, so there is no "never started" pick to make.
  const picks = suggestions([
    piece({ last_practiced_at: ago(9) }),
    piece({ last_practiced_at: ago(3) }),
  ]);

  assert.deepEqual(
    picks.map((p) => p.label),
    ["Left the longest", "If you only have a few minutes"],
  );
});

test("the reason under a pick is true of that pick", () => {
  const picks = suggestions([
    piece({ last_practiced_at: ago(1) }),
    piece({ last_practiced_at: null }),
    piece({ duration_seconds: 20, difficulty: 1, last_practiced_at: ago(0) }),
  ]);

  const byLabel = Object.fromEntries(picks.map((p) => [p.label, p]));
  assert.match(byLabel["Left the longest"].reason, /yesterday/);
  assert.equal(byLabel["Never started"].piece.last_practiced_at, null);
  assert.match(byLabel["If you only have a few minutes"].reason, /Under a minute.+easy/);
});

/* -------------------------------------------------------------------------- */

test("accents in the title do not hide a song from the person looking for it", () => {
  const elise = piece({
    title: "Für Elise",
    composer: "Beethoven",
    source_filename: "beethoven-fur-elise.mid",
  });

  // What anyone actually types, and what the file was called.
  assert.ok(matches(elise, "fur elise"));
  assert.ok(matches(elise, "Fur"));
  // The real spelling still works, from either side.
  assert.ok(matches(elise, "für"));
  assert.ok(matches(piece({ title: "Gymnopédie" }), "gymnopedie"));
});

test("words match in any order and across title, composer and filename", () => {
  const minuet = piece({
    title: "Minuet in G",
    composer: "Christian Petzold",
    source_filename: "petzold-minuet-in-g.mid",
  });

  assert.ok(matches(minuet, "petzold minuet"), "two terms, wrong order, two different fields");
  assert.ok(matches(minuet, "  minuet   g  "), "stray whitespace is not a term");
  assert.ok(matches(minuet, ""), "an empty box hides nothing");
  assert.equal(matches(minuet, "minuet bach"), false, "every word has to land, not just one");
});

test("a song with no composer is still searchable and never throws", () => {
  const anon = piece({ title: "Untitled", composer: null, source_filename: "x.mid" });
  assert.ok(matches(anon, "untitled"));
  assert.equal(matches(anon, "chopin"), false);
});
