import { LibrarySkeleton } from "@/components/Skeletons";

/**
 * The catalogue is server-rendered from Supabase on every request, so this is
 * what the reader sees while that query runs. It is the real page unwritten,
 * at the real measurements, so nothing jumps when the songs arrive.
 */
export default function Loading() {
  return <LibrarySkeleton />;
}
