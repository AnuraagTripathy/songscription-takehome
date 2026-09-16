/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev overlay badge sits on top of the interface; this is a design surface.
  devIndicators: false,
  // `next build` and `next dev` share .next by default, so building while the
  // dev server is running strips the running app of its CSS. Separate dirs make
  // that collision impossible rather than something to remember.
  //
  // Only on this machine, though: there is no dev server to protect on a build
  // server, and Vercel's builder looks for `.next` by name.
  distDir:
    process.env.NODE_ENV === "production" && !process.env.VERCEL ? ".next-build" : ".next",
};

export default nextConfig;
