/**
 * The demo password, in one place so the door and the lock agree.
 *
 * A shared password, not an account system: there is nothing behind the door
 * that the password does not already buy, so the cookie simply holds it and the
 * middleware compares. Set DEMO_PASSWORD to change it.
 */
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "songscription123";

export const GATE_COOKIE = "demo";
