import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const BUCKET = "midi";

/**
 * Exactly the columns `Piece` declares, rather than `*`.
 *
 * `*` was also shipping `search_vector` — a Postgres tsvector, serialised, to
 * a browser that has no use for one. Naming the columns makes the row type the
 * contract: anything the table grows for the server's own benefit stays on the
 * server unless someone adds it here on purpose.
 */
export const PIECE_COLUMNS =
  "id,created_at,title,composer,source_filename,storage_path,file_size_bytes,checksum,duration_seconds,tempo_bpm,time_signature,key_signature,key_is_estimated,note_count,lowest_note,highest_note,distinct_pitch_count,max_simultaneous_notes,notes_per_second,black_key_fraction,track_count,two_hands,two_hands_basis,difficulty,difficulty_factors,pitch_map,notes,in_progress,is_favourite,last_practiced_at,practice_seconds,session_count";

export function isConfigured(): boolean {
  return Boolean(url && (serviceKey || anonKey));
}

/**
 * Server-side client. Prefers the service-role key so uploads and inserts work
 * regardless of how RLS is set up; falls back to the anon key, which is all the
 * demo policy in `supabase/schema.sql` needs.
 *
 * Only ever imported from route handlers and server components — the
 * service-role key must not reach the browser.
 */
export function supabase(): SupabaseClient {
  if (!url || !(serviceKey || anonKey)) {
    throw new Error("Supabase is not configured. See .env.example.");
  }
  return createClient(url, (serviceKey ?? anonKey)!, {
    auth: { persistSession: false },
  });
}

export function publicFileUrl(storagePath: string): string {
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
