import { NextResponse } from "next/server";
import { supabase, BUCKET, isConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** The only mutable fields: the user's own layer, never the measured one. */
const EDITABLE = [
  "in_progress",
  "is_favourite",
  "title",
  "composer",
  "notes",
  "last_practiced_at",
  "practice_seconds",
  "session_count",
] as const;

export async function PATCH(request: Request, { params }: Params) {
  if (!isConfigured()) return fail(503, "Not connected to the database.");
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return fail(400, "Nothing to change.");
  }

  const { data, error } = await supabase()
    .from("pieces")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(500, error.message);
  return NextResponse.json({ piece: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isConfigured()) return fail(503, "Not connected to the database.");
  const { id } = await params;
  const db = supabase();

  const { data: piece } = await db
    .from("pieces")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await db.from("pieces").delete().eq("id", id);
  if (error) return fail(500, error.message);

  if (piece?.storage_path) {
    await db.storage.from(BUCKET).remove([piece.storage_path]);
  }
  return NextResponse.json({ ok: true });
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}
