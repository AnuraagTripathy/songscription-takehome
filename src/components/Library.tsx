"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, Search, Star, X } from "lucide-react";
import { FavouriteButton, LevelMarks, PlayButton } from "./kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevealButton } from "@/components/ui/button-6";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARD_GRID, HEADER_BAR, PAGE_SHELL, TOOLBAR_BAR } from "@/lib/utils";
import { PitchMap } from "./PitchMap";
import { SongCard, SongRow, Summary } from "./SongCard";
import { SongSheet } from "./SongSheet";
import { AddSong } from "./AddSong";
import {
  fileUrl,
  lastPractised,
  level,
  lastPlayedLine,
  LEVELS,
  matches,
  suggestions,
  type Piece,
  type Suggestion,
} from "@/lib/piece";

/**
 * How many songs are drawn before the "show more" line.
 *
 * Not a guess: at 300 cards the page was 41,000 SVG rects and every keystroke
 * in the search box cost 400ms, because typing re-renders the whole grid. The
 * note drawings are the point of this library, so the answer is to draw fewer
 * of them, not to draw them worse. 48 fills three columns evenly.
 */
const PAGE = 48;

/**
 * Below this many songs, a filter is a control with nothing to do. An empty
 * book was still offering a search box, and three songs came with four ways to
 * narrow them — the tools have to arrive when the problem does.
 */
const NEEDS_NARROWING = 8;

type Sort = "recent" | "recently-played" | "longest-untouched" | "shortest" | "easiest" | "az";

const SORTS: { key: Sort; label: string }[] = [
  { key: "recent", label: "Newest first" },
  { key: "recently-played", label: "Played most recently" },
  { key: "longest-untouched", label: "Longest since played" },
  { key: "shortest", label: "Shortest first" },
  { key: "easiest", label: "Easiest first" },
  { key: "az", label: "A to Z" },
];

export function Library({ initial, configured }: { initial: Piece[]; configured: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>(initial);
  const [query, setQuery] = useState("");
  const [hardness, setHardness] = useState<number | "all">("all");
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [view, setView] = useState<"grid" | "ribbon">("grid");
  const [finishing, setFinishing] = useState(false);
  const [practising, setPractising] = useState<"idle" | "working" | "done">("idle");

  // Restored after mount rather than during render, so the server and the first
  // client paint agree and nothing flashes the wrong layout.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("songscription:view");
      if (saved === "grid" || saved === "ribbon") setView(saved);
    } catch {
      // private window, or storage blocked: the default is fine
    }
  }, []);

  function chooseView(next: "grid" | "ribbon") {
    setView(next);
    try {
      window.localStorage.setItem("songscription:view", next);
    } catch {
      // nothing to do; the choice just will not outlive the session
    }
  }
  const [sort, setSort] = useState<Sort>("recent");
  const [openId, setOpenId] = useState<string | null>(null);

  const open = pieces.find((p) => p.id === openId) ?? null;
  const search = useRef<HTMLInputElement>(null);

  // Everything you have put on the desk, most recently touched first. More than
  // one is normal — people learn two pieces at once — and the page used to show
  // the top sheet as though it were the only one.
  const onTheDesk = useMemo(
    () => pieces.filter((p) => p.in_progress).sort((a, b) => when(b) - when(a)),
    [pieces],
  );
  // Which sheet of the stack is face up. Clamped on read rather than corrected
  // in an effect, so finishing the last piece on the desk cannot leave the
  // index pointing past the end for a frame.
  const [deskIndex, setDeskIndex] = useState(0);
  const deskPos = Math.min(deskIndex, Math.max(0, onTheDesk.length - 1));
  const current = onTheDesk[deskPos] ?? null;

  const flip = useCallback(
    (delta: number) =>
      setDeskIndex((i) => {
        const n = onTheDesk.length;
        if (n < 2) return 0;
        const from = Math.min(i, n - 1);
        return (from + delta + n) % n;
      }),
    [onTheDesk.length],
  );

  // Ctrl/Cmd+F and "/" go to the search box. Finding a song is what "find"
  // means on this page, so taking the shortcut is the honest thing to do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);
      const findKey = (e.key === "f" || e.key === "F") && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !typing;

      // Left and right walk the desk, the way you would thumb a stack of cards.
      // Only when there is a stack, only when nothing is open over the page,
      // and never while someone is typing into a field.
      const arrow = (e.key === "ArrowLeft" || e.key === "ArrowRight") && !typing;
      if (arrow && !openId && onTheDesk.length > 1) {
        e.preventDefault();
        flip(e.key === "ArrowRight" ? 1 : -1);
        return;
      }

      if (!findKey && !slash) return;
      if (openId) return;
      e.preventDefault();
      search.current?.focus();
      search.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, flip, onTheDesk.length]);

  // Below four songs the whole book fits on one screen, and a shelf pointing at
  // three of them is just the same grid twice. It also stands down while you
  // are searching: you already know what you are looking for.
  const picks = useMemo(
    () =>
      pieces.length < 4 || query.trim() ? [] : suggestions(pieces, current?.id),
    [pieces, current, query],
  );

  // Reset when the matching set changes — not on sort, which reorders the same
  // songs and has no business throwing away what you have already scrolled.
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [query, hardness, onlyFavourites]);

  /**
   * Search runs in both places on purpose.
   *
   * The browser filters the rows it already holds on the very first keystroke,
   * so typing never waits for a network. A debounced query then goes to
   * Postgres, which owns the GIN index and — unlike the browser — can see rows
   * this page never loaded. Local paints, the server decides. At this library's
   * size the two agree and you see nothing; past the point where the grid stops
   * holding everything, the server is the only one of the two that is right.
   */
  const [remote, setRemote] = useState<Piece[] | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (!configured || !q) {
      setRemote(null);
      return;
    }
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pieces?q=${encodeURIComponent(q)}`, {
          signal: abort.signal,
        });
        if (!res.ok) return;
        const payload = await res.json();
        setRemote(payload.pieces as Piece[]);
      } catch {
        // Offline, or a newer keystroke cancelled this one. The local matches
        // are already on screen, so there is nothing to tell the user.
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query, configured]);

  const shown = useMemo(() => {
    // When the server has answered, its rows ARE the match set — but prefer the
    // local copy of any row we also hold, so a favourite toggled a moment ago
    // does not flicker back to its pre-click state.
    const local = new Map(pieces.map((p) => [p.id, p]));
    const base = remote ? remote.map((r) => local.get(r.id) ?? r) : pieces;
    return base
      .filter((p) => {
        if (onlyFavourites && !p.is_favourite) return false;
        if (hardness !== "all" && p.difficulty !== hardness) return false;
        // Postgres has already matched its rows; local ones still have to earn it.
        return remote ? true : matches(p, query);
      })
      .sort(comparators[sort]);
  }, [pieces, remote, query, hardness, sort, onlyFavourites]);

  async function patch(piece: Piece, changes: Partial<Piece>) {
    const next = { ...piece, ...changes };
    setPieces((c) => c.map((p) => (p.id === piece.id ? next : p)));
    if (!configured) return;
    const res = await fetch(`/api/pieces/${piece.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!res.ok) setPieces((c) => c.map((p) => (p.id === piece.id ? piece : p)));
  }

  function favourite(piece: Piece) {
    return patch(piece, { is_favourite: !piece.is_favourite });
  }

  async function remove(piece: Piece) {
    setPieces((c) => c.filter((p) => p.id !== piece.id));
    setOpenId(null);
    if (!configured) return;
    const res = await fetch(`/api/pieces/${piece.id}`, { method: "DELETE" });
    if (!res.ok) setPieces((c) => [piece, ...c]);
  }

  return (
    <>
      {!configured && <PreviewNotice />}
      {open && (
        <SongSheet
          piece={open}
          onClose={() => setOpenId(null)}
          onPatch={(changes) => patch(open, changes)}
          onDelete={() => remove(open)}
        />
      )}

      <div className="board min-h-screen">
        <div className={PAGE_SHELL}>
          {/* --- the label glued across the cover --- */}
          <header className={HEADER_BAR}>
            <h1 className="font-book text-[19px] font-semibold tracking-[-0.01em] text-graphite">
              Songscription
            </h1>
            {/* Rendered away rather than `hidden`: the attribute sets display:none
                from the UA sheet, which any author `display` — here Tailwind's
                `flex` — silently wins against. It looked hidden in review and
                was not. */}
            {pieces.length > 0 && (
            <div className="relative flex w-full min-w-0 items-center sm:ml-auto sm:max-w-[26rem] sm:flex-1">
              <label htmlFor="song-search" className="sr-only">
                Search your songs
              </label>
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-graphite-soft"
                strokeWidth={1.75}
              />
              <Input
                id="song-search"
                ref={search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your songs"
                aria-keyshortcuts="Control+F /"
                className="pl-9 pr-[4.5rem] transition-colors hover:border-graphite-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kraft-deep"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear the search"
                  className="absolute right-3 rounded-[3px] text-graphite-soft transition-colors hover:text-kraft-deep"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-3 hidden rounded-[3px] border border-rule px-1.5 py-px text-[11.5px] font-medium text-graphite-soft sm:block">
                  Ctrl F
                </kbd>
              )}
            </div>
            )}
          </header>

          {pieces.length === 0 ? (
            <Empty onAdded={(p) => setPieces((c) => [p, ...c])} onOpen={setOpenId} />
          ) : (
            <>
              {current ? (
                <section className="mb-14">
                  {/* Sheets peeking out underneath when more than one piece is
                      on the desk, so the count is something you see rather than
                      something you read. */}
                  <div className="relative">
                    {onTheDesk.length > 2 && (
                      <div
                        aria-hidden
                        className="sheet absolute inset-x-6 -bottom-[15px] top-8 rounded-[3px]"
                      />
                    )}
                    {onTheDesk.length > 1 && (
                      <div
                        aria-hidden
                        className="sheet absolute inset-x-3 -bottom-[8px] top-4 rounded-[3px]"
                      />
                    )}
                  <article key={current.id} className="lay-down sheet sheet-raised relative">
                    <div className="flex flex-wrap items-end gap-x-8 gap-y-4 px-4 pb-4 pt-5 md:gap-y-5 md:px-8 md:pb-5 md:pt-6">
                      <div className="min-w-0 flex-1">
                        {/* The page at the top is whichever piece is still on
                            the desk, which for a file just added is one nobody
                            has played yet — so the label has to be true before
                            there is anything to return to. */}
                        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-[12.5px] font-semibold uppercase tracking-[0.11em] text-graphite-soft">
                            {current.last_practiced_at
                              ? "Pick up where you left off"
                              : "The one you are starting"}
                            {onTheDesk.length > 1 && (
                              <span>
                                {"  ·  "}
                                {deskPos + 1} of {onTheDesk.length} on the desk
                              </span>
                            )}
                          </p>
                          {onTheDesk.length > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => flip(-1)}
                                aria-label="The sheet before this one"
                                className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-rule text-graphite-soft transition-colors hover:bg-paper-warm hover:text-graphite active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kraft-deep"
                              >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => flip(1)}
                                aria-label="The next sheet on the desk"
                                className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-rule text-graphite-soft transition-colors hover:bg-paper-warm hover:text-graphite active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kraft-deep"
                              >
                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                              </button>
                              <kbd className="ml-1 hidden rounded-[3px] border border-rule px-1.5 py-px text-[11px] font-medium text-graphite-soft sm:block">
                                ← →
                              </kbd>
                            </div>
                          )}
                        </div>
                        <h2 className="font-book text-[clamp(1.9rem,4.4vw,3rem)] font-medium leading-[1.06] tracking-[-0.022em] text-graphite">
                          {current.title}
                        </h2>
                        <p className="mt-2 text-[15px] text-graphite-soft">
                          {current.composer ?? "Composer unknown"}
                        </p>
                        <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-graphite">
                          <LevelMarks level={current.difficulty} />
                          <Summary piece={current} />
                        </p>
                      </div>
                      <div className="flex w-full items-center gap-2 md:w-auto md:gap-3">
                        <FavouriteButton
                          favourite={current.is_favourite}
                          title={current.title}
                          onToggle={() => favourite(current)}
                        />
                        <PlayButton
                          id={current.id}
                          fileUrl={fileUrl(current)}
                          title={current.title}
                          size="large"
                          className="min-w-0 flex-1 md:flex-none"
                        />
                        <RevealButton
                          reveal="Open the page"
                          onClick={() => setOpenId(current.id)}
                          className="min-w-0 flex-1 md:flex-none"
                        >
                          See how to start
                        </RevealButton>
                      </div>
                    </div>

                    <div className="squared border-y border-rule px-4 py-3.5 md:px-8 md:py-4">
                      <PitchMap
                        notes={current.pitch_map}
                        lowest={current.lowest_note}
                        highest={current.highest_note}
                        className="h-20 w-full md:h-24"
                        ariaLabel={`The shape of ${current.title}.`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-8 md:py-2.5">
                      <p className="text-[13px] text-graphite-soft">
                        {lastPlayedLine(current.last_practiced_at)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {/* ponytail: logs that a session happened, which is all
                            the data model honestly knows. A real practice mode —
                            timer, loop a bar, slow it down — hangs off this
                            button when it exists; practice_seconds stays
                            untouched until something actually measures it. */}
                        <Button
                          variant="paper"
                          size="sm"
                          busy={practising === "working"}
                          done={practising === "done"}
                          onClick={async () => {
                            setPractising("working");
                            try {
                              await patch(current, {
                                last_practiced_at: new Date().toISOString(),
                                session_count: current.session_count + 1,
                              });
                              setPractising("done");
                              window.setTimeout(() => setPractising("idle"), 1800);
                            } catch {
                              // A dropped connection must not leave the control
                              // disabled for the rest of the session.
                              setPractising("idle");
                            }
                          }}
                        >
                          {practising === "done" ? "Logged" : "Practise"}
                        </Button>
                        <Button
                          variant="quiet"
                          size="sm"
                          busy={finishing}
                          onClick={async () => {
                            setFinishing(true);
                            try {
                              await patch(current, { in_progress: false });
                            } finally {
                              setFinishing(false);
                            }
                          }}
                        >
                          Done with this
                        </Button>
                      </div>
                    </div>
                  </article>
                  </div>
                </section>
              ) : (
                <ClearDesk />
              )}

              {picks.length > 0 && (
                <Shelf picks={picks} onOpen={setOpenId} />
              )}

              {/* --- the rest of the book --- */}
              <section>
                <div className={TOOLBAR_BAR}>
                  <h2 className="font-book text-[17px] font-medium text-graphite">
                    {shown.length === pieces.length
                      ? `Your songs · ${pieces.length}`
                      : `Your songs · ${shown.length} of ${pieces.length}`}
                  </h2>
                  <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-auto sm:w-auto sm:flex-nowrap">
                    <div
                      role="group"
                      aria-label="How to show your songs"
                      className="flex shrink-0 overflow-hidden rounded-[5px] border border-rule bg-paper shadow-lift"
                    >
                      {(
                        [
                          { key: "grid", label: "Cards", Icon: LayoutGrid },
                          { key: "ribbon", label: "List", Icon: Rows3 },
                        ] as const
                      ).map(({ key, label, Icon }) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={view === key}
                          title={`Show your songs as ${label.toLowerCase()}`}
                          onClick={() => chooseView(key)}
                          className={`inline-flex h-10 items-center gap-2 px-3.5 text-[14px] font-semibold transition-colors active:translate-y-px ${
                            view === key
                              ? "bg-kraft text-graphite"
                              : "text-graphite-soft hover:bg-paper-warm hover:text-graphite"
                          }`}
                        >
                          <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                          <span className="sr-only sm:not-sr-only">{label}</span>
                        </button>
                      ))}
                    </div>
                    {pieces.length >= NEEDS_NARROWING && (
                      <>
                    <Button
                      variant={onlyFavourites ? "default" : "paper"}
                      aria-pressed={onlyFavourites}
                      onClick={() => setOnlyFavourites((v) => !v)}
                      className="shrink-0"
                    >
                      <Star strokeWidth={1.75} fill={onlyFavourites ? "currentColor" : "none"} />
                      Favourites
                    </Button>
                    <Select
                      value={String(hardness)}
                      onValueChange={(v) => setHardness(v === "all" ? "all" : Number(v))}
                    >
                      <SelectTrigger
                        className="w-[calc(50%-0.3125rem)] sm:w-[11rem]"
                        aria-label="Show songs of this difficulty"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any difficulty</SelectItem>
                        {LEVELS.map((l) => (
                          <SelectItem key={l.level} value={String(l.level)}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                      <SelectTrigger className="w-[calc(50%-0.3125rem)] sm:w-[13rem]" aria-label="Sort your songs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORTS.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      </>
                    )}
                  </div>
                </div>

                {shown.length === 0 ? (
                  <NoMatches
                    query={query}
                    hardness={hardness}
                    onClear={() => {
                      setQuery("");
                      setHardness("all");
                      setOnlyFavourites(false);
                    }}
                  />
                ) : view === "ribbon" ? (
                  <ul className="space-y-2">
                    {shown.slice(0, limit).map((piece, i) => (
                      <SongRow
                        key={piece.id}
                        piece={piece}
                        index={i}
                        onOpen={(p) => setOpenId(p.id)}
                        onFavourite={favourite}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className={CARD_GRID}>
                    {shown.slice(0, limit).map((piece, i) => (
                      <SongCard
                        key={piece.id}
                        piece={piece}
                        index={i}
                        onOpen={(p) => setOpenId(p.id)}
                        onFavourite={favourite}
                      />
                    ))}
                  </div>
                )}

                {shown.length > limit && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <Button variant="paper" onClick={() => setLimit((n) => n + PAGE)}>
                      Show {Math.min(PAGE, shown.length - limit)} more
                    </Button>
                    <p aria-live="polite" className="text-[13px] text-graphite-soft">
                      Showing {limit} of {shown.length}
                    </p>
                  </div>
                )}
              </section>

              <section className="mt-16 max-w-[46rem]">
                <h2 className="kraft mb-5 inline-block rounded-[3px] px-3.5 py-1.5 font-book text-[17px] font-medium text-graphite shadow-lift">
                  Add a song
                </h2>
                <AddSong onAdded={(p) => setPieces((c) => [p, ...c])} onOpen={setOpenId} />
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * What stands where the piece in progress was.
 *
 * Marking the last song done used to leave the top of the page simply missing —
 * the largest thing on it gone, and nothing saying why or what to do instead.
 * An empty desk is a state worth drawing, not a gap.
 */
function ClearDesk() {
  return (
    <section className="mb-14">
      <div className="lay-down sheet sheet-raised px-4 py-9 text-center md:px-8 md:py-11">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.11em] text-graphite-soft">
          Nothing on the desk
        </p>
        <h2 className="mx-auto mt-2 max-w-[20ch] font-book text-[clamp(1.7rem,4vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.022em] text-graphite">
          Choose a song to practise
        </h2>
        <p className="mx-auto mt-3 max-w-[54ch] font-book text-[16px] leading-[1.6] text-graphite-soft">
          Open any song and press <span className="text-graphite">Practise this</span>. It will sit
          up here, with its shape and where to start, until you are done with it.
        </p>
      </div>
    </section>
  );
}

/**
 * For the evening you open the book with no plan.
 *
 * Not a recommendation engine — three questions the catalogue can already
 * answer about itself, each one showing the fact that chose it. A suggestion
 * you cannot interrogate is one you have to take on trust, and nothing else on
 * this page asks you to do that.
 */
function Shelf({ picks, onOpen }: { picks: Suggestion[]; onOpen: (id: string) => void }) {
  return (
    <section className="mb-14">
      <h2 className="kraft mb-4 inline-block rounded-[3px] px-3.5 py-1.5 font-book text-[17px] font-medium text-graphite shadow-lift">
        Not sure what to play?
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map(({ piece, label, reason }, i) => (
          <li
            key={piece.id}
            className="lay-down sheet flex flex-col transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-lift-2"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <button
              onClick={() => onOpen(piece.id)}
              className="block w-full cursor-pointer rounded-[3px] px-4 pb-2 pt-3.5 text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-kraft-deep"
            >
              <span className="block text-[12.5px] font-semibold uppercase tracking-[0.11em] text-kraft-deep">
                {label}
              </span>
              <span className="mt-1.5 block font-book text-[19px] font-medium leading-[1.2] tracking-[-0.011em] text-graphite">
                {piece.title}
              </span>
              <span className="mt-0.5 block truncate text-[13.5px] text-graphite-soft">
                {piece.composer ?? "Composer unknown"}
              </span>
              {/* Two lines' worth whether the reason fills them or not, so the
                  three note strips below sit on one line across the row. */}
              <span className="mt-2 block min-h-[3.1em] font-book text-[15px] leading-[1.55] text-graphite-soft">
                {reason}
              </span>
            </button>

            <div className="squared mx-4 mt-2.5 rounded-[2px] border border-rule px-2 py-1.5">
              <PitchMap
                notes={piece.pitch_map}
                lowest={piece.lowest_note}
                highest={piece.highest_note}
                className="h-10 w-full"
                opening
                ariaLabel=""
              />
            </div>

            <div className="mt-auto flex items-center gap-3 px-4 pb-4 pt-3">
              <PlayButton id={piece.id} fileUrl={fileUrl(piece)} title={piece.title} />
              <span className="ml-auto flex items-center gap-2 text-[13px] text-graphite-soft">
                <LevelMarks level={piece.difficulty} />
                {level(piece.difficulty).name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Empty({
  onAdded,
  onOpen,
}: {
  onAdded: (piece: Piece) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="py-4">
      <h2 className="max-w-[18ch] font-book text-[clamp(1.9rem,4.4vw,2.9rem)] font-medium leading-[1.1] tracking-[-0.022em] text-paper">
        The book is empty
      </h2>
      <p className="mt-3 max-w-[62ch] font-book text-[17px] leading-[1.65] text-rule">
        Every song you have transcribed lands here. Drop a MIDI file in and it gets read straight
        away: how long it takes, how hard it is, which keys it uses, and where to start.
      </p>
      <div className="mt-8">
        <AddSong onAdded={onAdded} onOpen={onOpen} />
      </div>
    </div>
  );
}

function NoMatches({
  query,
  hardness,
  onClear,
}: {
  query: string;
  hardness: number | "all";
  onClear: () => void;
}) {
  return (
    <div className="sheet px-6 py-9">
      <p className="font-book text-[19px] font-medium text-graphite">Nothing matches</p>
      <p className="mt-2 max-w-[58ch] font-book text-[15px] leading-[1.6] text-graphite-soft">
        {query && hardness !== "all"
          ? `No song called “${query}” is rated ${level(hardness).name.toLowerCase()}. It might be at a different difficulty.`
          : query
            ? `Nothing in your songs is called “${query}”.`
            : `You have nothing rated ${level(hardness as number).name.toLowerCase()} yet.`}
      </p>
      <Button variant="paper" className="mt-5" onClick={onClear}>
        Clear the filters
      </Button>
    </div>
  );
}

function PreviewNotice() {
  return (
    <p className="bg-board-deep px-5 py-2 text-center text-[12.5px] text-rule md:px-8">
      Preview. This is the real interface over the sample library, but nothing you change will
      survive a refresh until Supabase keys are added.
    </p>
  );
}

/* -------------------------------------------------------------------------- */

const comparators: Record<Sort, (a: Piece, b: Piece) => number> = {
  recent: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  // The one you were on yesterday, which is the usual reason for coming back.
  "recently-played": (a, b) => played(b) - played(a),
  "longest-untouched": (a, b) => when(a) - when(b),
  shortest: (a, b) => a.duration_seconds - b.duration_seconds,
  easiest: (a, b) => a.difficulty - b.difficulty || a.duration_seconds - b.duration_seconds,
  az: (a, b) => a.title.localeCompare(b.title),
};

/** Never played sorts as longest-untouched, using when it was added. */
function when(piece: Piece): number {
  return +new Date(piece.last_practiced_at ?? piece.created_at);
}

/** Zero, not -Infinity: two never-played songs have to compare equal, not NaN. */
function played(piece: Piece): number {
  return piece.last_practiced_at ? Date.parse(piece.last_practiced_at) : 0;
}
