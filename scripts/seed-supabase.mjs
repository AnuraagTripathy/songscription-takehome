/**
 * Puts the seed shelf into Supabase through the app's own upload endpoint.
 *
 * Deliberately not a direct database insert: every row is written by the same
 * code path a dropped file takes, so the analyser, the storage upload and the
 * duplicate check are all exercised, and the shelf cannot end up holding rows
 * the real flow could never produce.
 *
 *   npm run dev            # in one terminal
 *   node scripts/seed-supabase.mjs [http://127.0.0.1:3100]
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const origin = process.argv[2] ?? "http://127.0.0.1:3100";

/**
 * How long each piece has been on the shelf.
 *
 * The upload route marks whatever you just added as the piece you are working
 * on, which is right for one file and wrong for eight at once. These are the
 * same histories the offline preview uses, so the seeded database and the
 * no-credentials preview show the same library.
 */
const HISTORY = {
  "beethoven-fur-elise.mid": { daysAgo: 0, inProgress: true, favourite: true, sessions: 14 },
  "petzold-minuet-in-g.mid": { daysAgo: 2, sessions: 9 },
  "gruber-silent-night.mid": { daysAgo: 4, sessions: 5 },
  "pachelbel-canon-in-d.mid": { daysAgo: 7, favourite: true, sessions: 3 },
  "beethoven-ode-to-joy.mid": { daysAgo: 12, favourite: true, sessions: 11 },
  "trad-amazing-grace.mid": { daysAgo: 16, sessions: 6 },
  "trad-greensleeves.mid": { daysAgo: 19, sessions: 7 },
  "trad-twinkle-twinkle.mid": { daysAgo: 24, sessions: 4 },
  "beethoven-moonlight-sonata.mid": { daysAgo: null, sessions: 0 },
};
const dir = path.join(process.cwd(), "public", "seed");
const files = readdirSync(dir).filter((n) => n.endsWith(".mid"));

let added = 0;
let skipped = 0;

for (const name of files) {
  const bytes = readFileSync(path.join(dir, name));
  const body = new FormData();
  body.append("file", new File([bytes], name, { type: "audio/midi" }));

  const response = await fetch(`${origin}/api/pieces`, { method: "POST", body });
  const payload = await response.json().catch(() => ({}));

  if (response.ok) {
    added++;
    const p = payload.piece;
    const past = HISTORY[name] ?? { daysAgo: null, sessions: 0 };
    const patch = await fetch(`${origin}/api/pieces/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        in_progress: past.inProgress ?? false,
        is_favourite: past.favourite ?? false,
        session_count: past.sessions,
        practice_seconds: past.sessions * 9 * 60,
        last_practiced_at:
          past.daysAgo === null
            ? null
            : new Date(Date.now() - past.daysAgo * 86_400_000).toISOString(),
      }),
    });
    if (!patch.ok) {
      console.error(`FAILED  history for ${name}: ${patch.status}`);
      process.exitCode = 1;
    }
    console.log(
      `added   ${String(p.title).padEnd(32)} level ${p.difficulty}  ` +
        `${(p.two_hands ? "two hands" : "right hand only").padEnd(16)}` +
        `${past.inProgress ? "learning" : past.daysAgo === null ? "never played" : `${past.daysAgo}d ago`}`,
    );
  } else if (response.status === 409) {
    skipped++;
    console.log(`already ${name}`);
  } else {
    console.error(`FAILED  ${name}: ${response.status} ${payload.error ?? ""} ${payload.detail ?? ""}`);
    process.exitCode = 1;
  }
}

console.log(`\n${added} added, ${skipped} already there.`);
