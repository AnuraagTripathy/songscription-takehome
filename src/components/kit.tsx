"use client";

import * as React from "react";
import { Loader2, Play, Square, Star } from "lucide-react";
import { FrameButton } from "@/components/ui/frame-button";
import {
  play as audioPlay,
  stop as audioStop,
  seek as audioSeek,
  nowPlaying as audioNowPlaying,
  type ActiveNotes,
} from "@/lib/audio";

/**
 * How hard, as five squares on the ruling.
 *
 * The ramp is a palette law: sage, deep sage, clay, deep clay, board. It runs
 * from the ruling's own colour to the cover itself, so rank reads across the
 * whole shelf before a single word does — and the squares a piece does not
 * reach are drawn as empty ruling rather than switched off. The word is always
 * beside it; colour never carries this alone.
 */
const RAMP = ["#ccd5ae", "#a3b07c", "#d4a373", "#b4623a", "#39432f"];

export function LevelMarks({
  level,
  onBoard = false,
  className = "",
}: {
  level: number;
  onBoard?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-[11px] w-[11px] rounded-[1.5px]"
          style={
            i <= level
              ? { background: RAMP[i - 1], boxShadow: "inset 0 0 0 1px rgba(42,49,35,0.62)" }
              : {
                  boxShadow: `inset 0 0 0 1px ${
                    onBoard ? "rgba(204,213,174,0.45)" : "rgba(74,85,64,0.45)"
                  }`,
                }
          }
        />
      ))}
    </span>
  );
}

/**
 * A reading, counted off in squares on the ruling.
 *
 * The page already has a unit — the 24px lattice everything else sits on — so a
 * measurement here is squares filled out of ten, the way you would tally one in
 * the margin. It is the same device as the difficulty marks at a different
 * length, which is why the sheet needs no second chart language.
 */
export function Meter({ value, className = "" }: { value: number; className?: string }) {
  const filled = Math.max(1, Math.min(10, Math.round(value * 10)));
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="h-[9px] w-[9px] rounded-[1.5px]"
          style={
            i < filled
              ? { background: "#b4623a", boxShadow: "inset 0 0 0 1px rgba(42,49,35,0.5)" }
              : { boxShadow: "inset 0 0 0 1px rgba(74,85,64,0.45)" }
          }
        />
      ))}
    </span>
  );
}

/**
 * The star you put beside a piece you love.
 *
 * Hollow when the page is ordinary, filled in clay when it is one of yours. It
 * is a real toggle with a pressed state, a busy state while the change is
 * saving, and a label that says which way it will go.
 */
export function FavouriteButton({
  favourite,
  title,
  onToggle,
  className = "",
}: {
  favourite: boolean;
  title: string;
  onToggle: () => void | Promise<void>;
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      type="button"
      aria-pressed={favourite}
      aria-busy={busy}
      disabled={busy}
      title={favourite ? "In your favourites" : "Add to favourites"}
      aria-label={
        favourite ? `Remove ${title} from your favourites` : `Add ${title} to your favourites`
      }
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await onToggle();
        } finally {
          setBusy(false);
        }
      }}
      className={`group/fav inline-flex h-9 w-9 items-center justify-center rounded-[5px] border transition-[background-color,border-color,transform,opacity] duration-150 active:translate-y-px disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-deep ${
        favourite
          ? "border-kraft-deep/45 bg-kraft/35 text-kraft-deep hover:bg-kraft/55"
          : "border-transparent text-graphite-soft hover:border-rule hover:bg-paper-warm hover:text-kraft-deep"
      } ${className}`}
    >
      <Star
        className={`h-[19px] w-[19px] transition-transform duration-200 group-hover/fav:scale-110 group-active/fav:scale-95 ${
          busy ? "animate-pulse" : ""
        }`}
        strokeWidth={1.75}
        fill={favourite ? "currentColor" : "none"}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- *
 * Hear it.
 *
 * A beginner cannot read a MIDI picture, so hearing the piece is the only way
 * they can judge it. This is the primary act of the page and it is sized like
 * one, in the only fully saturated colour the page owns, inside the crop marks
 * that mark out a page on a printed sheet.
 *
 * The playing itself lives in a hook rather than in the button, because the
 * sheet needs the same playback the button starts: its roll has to follow the
 * playhead and move it. One owner, two controls.
 * -------------------------------------------------------------------------- */

export type PlayState = "idle" | "loading" | "playing";

export function usePlayback(id: string, fileUrl: string) {
  const [state, setState] = React.useState<PlayState>("idle");
  const [active, setActive] = React.useState<ActiveNotes>([]);
  const [transport, setTransport] = React.useState({ position: 0, duration: 0 });

  React.useEffect(
    () => () => {
      if (audioNowPlaying() === id) audioStop();
    },
    [id],
  );

  const start = React.useCallback(
    async (from: number) => {
      setState("loading");
      await audioPlay(
        id,
        fileUrl,
        {
          onEnd: () => {
            setState("idle");
            setActive([]);
          },
          onActive: setActive,
          onTime: setTransport,
        },
        from,
      );
      setState(audioNowPlaying() === id ? "playing" : "idle");
    },
    [id, fileUrl],
  );

  const toggle = React.useCallback(() => {
    if (state === "idle") {
      void start(0);
      return;
    }
    audioStop();
    setState("idle");
    setActive([]);
  }, [state, start]);

  // Pointing at a moment means play from there, whether or not it is running.
  const seekTo = React.useCallback(
    (seconds: number) => {
      if (audioNowPlaying() === id) {
        audioSeek(seconds);
        setTransport((t) => ({ ...t, position: seconds }));
        return;
      }
      void start(seconds);
    },
    [id, start],
  );

  return { state, active, transport, toggle, seekTo };
}

/** The key itself, told what to show. */
export function PlayControl({
  state,
  title,
  onToggle,
  size = "small",
  compact = false,
  className = "",
}: {
  state: PlayState;
  title: string;
  onToggle: () => void;
  size?: "small" | "large";
  compact?: boolean;
  className?: string;
}) {
  const large = size === "large";
  const busy = state === "loading";
  const playing = state === "playing";

  return (
    <FrameButton
      type="button"
      variant="clay"
      size={large ? 15 : 13}
      offset={large ? 6 : 5}
      className={`${large ? "h-12 px-6 text-[14px]" : "h-11 text-[13px]"} ${
        large ? "" : compact ? "px-3 sm:px-4" : "px-4"
      } gap-2.5 ${className}`}
      aria-label={playing ? `Stop ${title}` : `Play ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {busy ? (
        <Loader2 className={large ? "h-[17px] w-[17px] animate-spin" : "h-4 w-4 animate-spin"} />
      ) : playing ? (
        <Square
          className={large ? "h-[15px] w-[15px] fill-current" : "h-[13px] w-[13px] fill-current"}
          strokeWidth={0}
        />
      ) : (
        <Play
          className={large ? "h-[17px] w-[17px] fill-current" : "h-4 w-4 fill-current"}
          strokeWidth={0}
        />
      )}
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
        {playing ? "Stop" : busy ? "Loading" : "Play it"}
      </span>
    </FrameButton>
  );
}

/** A key that owns its own playback, for a card or a row. */
export function PlayButton({
  id,
  fileUrl,
  title,
  size = "small",
  className = "",
  compact = false,
}: {
  id: string;
  fileUrl: string;
  title: string;
  size?: "small" | "large";
  className?: string;
  compact?: boolean;
}) {
  const playback = usePlayback(id, fileUrl);
  return (
    <PlayControl
      state={playback.state}
      title={title}
      onToggle={playback.toggle}
      size={size}
      compact={compact}
      className={className}
    />
  );
}
