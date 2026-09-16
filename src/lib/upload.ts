import type { Piece } from "./piece";

export type UploadResult =
  | { ok: true; piece: Piece }
  | { ok: false; error: string; detail?: string; duplicateOf?: string };

export type Rejection = { status: number; error: string; detail: string };

/** A .mid is kilobytes. 2 MB is already absurd, and anything larger is audio. */
export const MAX_BYTES = 2 * 1024 * 1024;

/** Give up on a request that has not answered in this long. */
const TIMEOUT_MS = 30_000;

/**
 * The same rules on both sides of the wire. The browser runs them first so a
 * wrong file is refused in the same instant it is dropped, with no upload and
 * no round trip; the server runs them again because the browser is not a
 * trust boundary.
 */
export function checkFile(name: string, size: number): Rejection | null {
  if (!/\.(mid|midi)$/i.test(name)) {
    return {
      status: 415,
      error: `"${name}" is not a MIDI file.`,
      detail:
        "This catalogue takes .mid and .midi files — the ones Songscription gives you when a transcription finishes.",
    };
  }
  if (size === 0) {
    return {
      status: 400,
      error: `"${name}" is empty.`,
      detail: "The file has no contents. Try exporting it again.",
    };
  }
  if (size > MAX_BYTES) {
    return {
      status: 413,
      error: `"${name}" is too large for a MIDI file.`,
      detail: "MIDI files are usually a few kilobytes. Anything over 2 MB is probably audio, not MIDI.",
    };
  }
  return null;
}

/** One call site for adding a piece, shared by the drop zone and the starter stock. */
export async function postFile(file: File): Promise<UploadResult> {
  const rejected = checkFile(file.name, file.size);
  if (rejected) return { ok: false, error: rejected.error, detail: rejected.detail };

  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/pieces", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // A crashed route or a proxy in the way answers with HTML, not JSON.
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? "That did not work.",
        detail: payload.detail ?? `The server answered ${response.status}. Try again in a moment.`,
        duplicateOf: payload.duplicateOf,
      };
    }
    return { ok: true, piece: payload.piece as Piece };
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return {
        ok: false,
        error: "That upload took too long.",
        detail: "The server did not answer in thirty seconds. Nothing was saved — try again.",
      };
    }
    return {
      ok: false,
      error: "That upload did not reach the server.",
      detail: "Check your connection and try again.",
    };
  }
}
