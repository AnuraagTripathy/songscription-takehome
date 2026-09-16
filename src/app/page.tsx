import { Library } from "@/components/Library";
import { isConfigured, PIECE_COLUMNS, supabase } from "@/lib/supabase";
import { previewPieces } from "@/lib/preview";
import type { Piece } from "@/lib/piece";

// The library changes whenever a song is added, so it is never cached.
export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isConfigured()) {
    // No credentials: show the real interface over the seed library, and say
    // plainly that nothing will save.
    return <Library initial={await previewPieces()} configured={false} />;
  }

  // ponytail: the whole catalogue in one query, and every card drawn at once.
  // Measured at 5.5 KB a row, three quarters of it pitch_map, so 500 songs is
  // ~2.7 MB and ~95,000 SVG rects — the DOM gives out well before the search
  // does. Upgrade path when it bites: keep this query for the facet counts,
  // paginate the grid, and drop pitch_map from rows that are not on screen.
  const { data, error } = await supabase()
    .from("pieces")
    .select(PIECE_COLUMNS)
    .order("created_at", { ascending: false });

  return <Library initial={(error ? [] : (data ?? [])) as Piece[]} configured />;
}
