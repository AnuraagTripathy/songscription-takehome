import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { analyseMidi } from "./midi";
import type { Piece } from "./piece";

/**
 * With no Supabase credentials the page would be empty and nobody could see
 * what the product does. This measures the seed library with exactly the same
 * analyser the upload route uses and returns rows that never touch a database.
 *
 * Read-only, and the interface says so. The practice history is seeded, not
 * measured, and the detail view says that too.
 */

type Seed = {
  dir: "seed";
  file: string;
  composer?: string;
  daysAgo: number | null;
  inProgress?: boolean;
  favourite?: boolean;
  sessions: number;
};

// Ordered so the library reads like one somebody actually built up over time.
const LIBRARY: Seed[] = [
  { dir: "seed", file: "beethoven-fur-elise.mid", composer: "Beethoven", daysAgo: 0, inProgress: true, favourite: true, sessions: 14 },
  { dir: "seed", file: "petzold-minuet-in-g.mid", composer: "Christian Petzold", daysAgo: 2, sessions: 9 },
  { dir: "seed", file: "gruber-silent-night.mid", composer: "Franz Gruber", daysAgo: 4, sessions: 5 },
  { dir: "seed", file: "pachelbel-canon-in-d.mid", composer: "Johann Pachelbel", daysAgo: 7, favourite: true, sessions: 3 },
  { dir: "seed", file: "beethoven-ode-to-joy.mid", composer: "Beethoven", daysAgo: 12, favourite: true, sessions: 11 },
  { dir: "seed", file: "trad-amazing-grace.mid", composer: "Traditional", daysAgo: 16, sessions: 6 },
  { dir: "seed", file: "trad-greensleeves.mid", composer: "Traditional", daysAgo: 19, sessions: 7 },
  { dir: "seed", file: "trad-twinkle-twinkle.mid", composer: "Traditional", daysAgo: 24, sessions: 4 },
  { dir: "seed", file: "beethoven-moonlight-sonata.mid", composer: "Beethoven", daysAgo: null, sessions: 0 },
];

export async function previewPieces(): Promise<Piece[]> {
  const pieces = await Promise.all(
    LIBRARY.map(async (seed, index) => {
      let bytes: Buffer;
      try {
        bytes = await readFile(path.join(process.cwd(), "public", seed.dir, seed.file));
      } catch {
        return null;
      }

      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      let analysis;
      try {
        analysis = analyseMidi(buffer as ArrayBuffer, seed.file);
      } catch {
        return null;
      }

      const checksum = createHash("sha256").update(bytes).digest("hex");

      const piece: Piece = {
        id: `preview-${checksum.slice(0, 8)}`,
        created_at: new Date(Date.now() - (index + 1) * 3 * 86_400_000).toISOString(),
        title: analysis.title,
        composer: seed.composer ?? analysis.composer,
        source_filename: seed.file,
        storage_path: `${seed.dir}/${seed.file}`,
        file_size_bytes: bytes.byteLength,
        checksum,
        duration_seconds: analysis.durationSeconds,
        tempo_bpm: analysis.tempoBpm,
        time_signature: analysis.timeSignature,
        key_signature: analysis.keySignature,
        key_is_estimated: analysis.keyIsEstimated,
        note_count: analysis.noteCount,
        lowest_note: analysis.lowestNote,
        highest_note: analysis.highestNote,
        distinct_pitch_count: analysis.distinctPitchCount,
        max_simultaneous_notes: analysis.maxSimultaneousNotes,
        notes_per_second: analysis.notesPerSecond,
        black_key_fraction: analysis.blackKeyFraction,
        track_count: analysis.trackCount,
        two_hands: analysis.twoHands,
        two_hands_basis: analysis.twoHandsBasis,
        difficulty: analysis.difficulty,
        difficulty_factors: analysis.difficultyFactors,
        pitch_map: analysis.pitchMap,
        notes: null,
        in_progress: seed.inProgress ?? false,
        is_favourite: seed.favourite ?? false,
        last_practiced_at:
          seed.daysAgo === null ? null : new Date(Date.now() - seed.daysAgo * 86_400_000).toISOString(),
        practice_seconds: seed.sessions * 9 * 60,
        session_count: seed.sessions,
      };
      return piece;
    }),
  );

  return pieces.filter((piece): piece is Piece => piece !== null);
}
