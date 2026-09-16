import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FrameButton } from "@/components/ui/frame-button";
import { DEMO_PASSWORD, GATE_COOKIE } from "@/lib/gate";

export const metadata = { title: "Songscription — the door" };

/**
 * The front of the book.
 *
 * A kraft label glued to the cover, the way a school exercise book carries its
 * owner's name: the same paper-on-board object the library is made of, at the
 * size of one field. Nothing about it is a login screen — there is no account
 * here, only a word that opens the demo.
 */
export default async function Gate({
  searchParams,
}: {
  searchParams: Promise<{ wrong?: string }>;
}) {
  const wrong = "wrong" in (await searchParams);

  async function enter(form: FormData) {
    "use server";
    if (form.get("password") !== DEMO_PASSWORD) redirect("/gate?wrong");

    (await cookies()).set(GATE_COOKIE, DEMO_PASSWORD, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/");
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6 py-16">
      <form
        action={enter}
        className="w-full max-w-[380px] rounded-[6px] bg-paper p-7 shadow-lift-2"
        style={{
          // Squared manuscript stock, the same ruling the library is printed on.
          backgroundImage:
            "linear-gradient(rgba(204,213,174,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(204,213,174,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "-1px -1px",
        }}
      >
        <p className="font-label text-[11px] font-semibold uppercase tracking-[0.22em] text-graphite-soft">
          Songscription
        </p>
        <h1 className="mt-2 font-book text-[26px] leading-[1.15] text-graphite">
          A demo, behind one word.
        </h1>
        <p className="mt-3 font-book text-[14px] leading-[1.55] text-graphite-soft">
          The library is not public yet. Type the password you were given and the
          shelf opens.
        </p>

        <label
          htmlFor="password"
          className="mt-7 block font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-graphite-soft"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          aria-describedby={wrong ? "wrong" : undefined}
          className="mt-2 bg-paper-warm"
        />

        {wrong ? (
          <p id="wrong" role="alert" className="mt-2.5 font-book text-[13px] text-kraft-deep">
            That is not the word. Try it again.
          </p>
        ) : null}

        <FrameButton type="submit" className="mt-6 h-10 w-full text-[12px]">
          Open the library
        </FrameButton>
      </form>
    </main>
  );
}
