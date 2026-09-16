import { NextResponse } from "next/server";
import { analyseMidi, MidiError } from "@/lib/midi";
import { checkFile } from "@/lib/upload";
import { fold } from "@/lib/piece";
import { supabase, BUCKET, isConfigured, PIECE_COLUMNS } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isConfigured()) return NextResponse.json({ pieces: [] });

  const q = new URL(request.url).searchParams.get("q")?.trim();

  let query = supabase().from("pieces").select(PIECE_COLUMNS);

  if (q) {
    // Folded here as well as in the browser, so the endpoint is correct however
    // it is called: the stored vector is unaccented, so the query has to be
    // too, or "Für" stops matching the row it built. `websearch` is the forgiving
    // parser — bare words, quoted phrases, and no syntax errors to hand back to
    // someone who was only typing a song title.
    query = query.textSearch("search_vector", fold(q), {
      type: "websearch",
      config: "simple",
    });
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return fail(500, "Could not read your catalogue.", error.message);
  return NextResponse.json({ pieces: data ?? [] });
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return fail(
      503,
      "The catalogue is not connected to its database yet.",
      "Add your Supabase keys to .env.local and restart the dev server. See .env.example.",
    );
  }

  // A cancelled upload or a malformed body throws here. Left unhandled it is a
  // framework stack trace, which the drop zone cannot say anything useful about.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "That upload did not arrive in one piece.", "The connection dropped partway. Try again.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail(400, "No file arrived.", "Try dropping the file again.");
  }

  // The browser has already run these; it is not a trust boundary, so run them again.
  const rejected = checkFile(file.name, file.size);
  if (rejected) return fail(rejected.status, rejected.error, rejected.detail);

  const bytes = await file.arrayBuffer();
  const checksum = await sha256(bytes);

  const db = supabase();

  // Duplicate check before anything is written, so uploading the same file
  // twice tells you what happened instead of quietly making a second copy.
  const { data: existing } = await db
    .from("pieces")
    .select("id, title")
    .eq("checksum", checksum)
    .maybeSingle();

  if (existing) return duplicate(existing.id, existing.title);

  let analysis;
  try {
    analysis = analyseMidi(bytes, file.name);
  } catch (error) {
    if (error instanceof MidiError) return fail(422, error.message, error.detail);
    return fail(
      422,
      `"${file.name}" could not be read as MIDI.`,
      "The file ends with .mid but its contents are not a MIDI file. Re-export it and try again.",
    );
  }

  // The path carries the checksum, so an object already sitting there is these
  // exact bytes — left behind by an upload whose row never landed. Reuse it
  // rather than dead-ending every future attempt at the same file.
  const storagePath = `${checksum.slice(0, 16)}-${sanitise(file.name)}`;
  const upload = await db.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: "audio/midi",
    upsert: false,
  });

  const weWroteTheObject = !upload.error;
  if (upload.error && !/already exists/i.test(upload.error.message)) {
    return fail(502, "The file did not finish uploading.", upload.error.message);
  }

  const { data, error } = await db
    .from("pieces")
    .insert({
      title: analysis.title,
      composer: analysis.composer,
      source_filename: file.name,
      storage_path: storagePath,
      file_size_bytes: file.size,
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
      in_progress: true, // the thing you just added is the thing you want to play
    })
    .select()
    .single();

  if (error) {
    // Two copies of the same file racing each other: the loser's row collides
    // on the unique checksum. The winner's row now owns this object, so this
    // is the duplicate answer — and emphatically not a cleanup.
    if (error.code === "23505") {
      const { data: winner } = await db
        .from("pieces")
        .select("id, title")
        .eq("checksum", checksum)
        .maybeSingle();
      if (winner) return duplicate(winner.id, winner.title);
    }
    // Otherwise, don't leave an orphan behind — but only remove the object if
    // this request is the one that put it there.
    if (weWroteTheObject) await db.storage.from(BUCKET).remove([storagePath]);
    return fail(500, "The file uploaded but could not be logged.", error.message);
  }

  return NextResponse.json({ piece: data }, { status: 201 });
}

function duplicate(id: string, title: string) {
  return NextResponse.json(
    {
      error: "You already have this one.",
      detail: `These are the same bytes as "${title}", which is already in your catalogue.`,
      duplicateOf: id,
    },
    { status: 409 },
  );
}

function fail(status: number, error: string, detail: string) {
  return NextResponse.json({ error, detail }, { status });
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sanitise(filename: string): string {
  return filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").slice(0, 80);
}
