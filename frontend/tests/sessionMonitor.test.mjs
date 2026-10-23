import assert from "node:assert/strict";
import { test } from "node:test";
import {
  INACTIVITY_TIMEOUT_MS,
  sessionEndReason,
  startSessionMonitor,
  tokenTimes,
} from "../src/features/auth/sessionMonitor.ts";

const START = 1_800_000_000_000;
const MINUTE = 60_000;
const token = (issuedAt = START, duration = INACTIVITY_TIMEOUT_MS) =>
  `header.${Buffer.from(JSON.stringify({ iat: issuedAt / 1000, exp: (issuedAt + duration) / 1000 })).toString("base64url")}.signature`;

function setup(t, renewError) {
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: START });
  const target = new EventTarget();
  let session = { token: token(), lastActivity: START };
  const ended = [];
  const errors = [];
  const renewed = [];
  const stop = startSessionMonitor({
    activityTarget: target,
    visibilityTarget: target,
    readSession: () => session,
    recordActivity: (now) => { session.lastActivity = now; },
    renew: async (oldToken) => {
      renewed.push(oldToken);
      if (renewError) throw renewError;
      session.token = token(Date.now());
    },
    expire: (reason) => { ended.push(reason); session = null; },
    reportError: (error) => errors.push(error),
  });
  t.after(stop);
  return { target, ended, errors, renewed, session: () => session };
}

test("uses exactly 30 minutes and expires at, not before, the inactivity boundary", () => {
  assert.equal(INACTIVITY_TIMEOUT_MS, 1_800_000);
  const session = { token: token(), lastActivity: START };
  assert.equal(sessionEndReason(session, START + INACTIVITY_TIMEOUT_MS - 1), null);
  assert.equal(sessionEndReason(session, START + INACTIVITY_TIMEOUT_MS), "inactive");
  assert.deepEqual(tokenTimes(session.token), { issuedAt: START, expiresAt: START + INACTIVITY_TIMEOUT_MS });
});

test("expired or malformed JWTs cannot be kept alive by movement", () => {
  assert.equal(sessionEndReason({ token: token(), lastActivity: START + MINUTE }, START + INACTIVITY_TIMEOUT_MS), "expired");
  assert.equal(sessionEndReason({ token: "broken", lastActivity: START }, START), "expired");
  assert.equal(sessionEndReason({ token: token(), lastActivity: NaN }, START), "inactive");
});

test("logs out idle users once, without renewing in the background", (t) => {
  const state = setup(t);
  t.mock.timers.tick(INACTIVITY_TIMEOUT_MS - 1000);
  assert.deepEqual(state.ended, []);
  t.mock.timers.tick(1000);
  assert.deepEqual(state.ended, ["inactive"]);
  assert.deepEqual(state.renewed, []);
  t.mock.timers.tick(MINUTE);
  assert.deepEqual(state.ended, ["inactive"]);
});

test("keyboard, pointer, scroll and touch activity keep active users signed in beyond 30 minutes", async (t) => {
  const state = setup(t);
  const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"];
  for (let minute = 0; minute < 40; minute += 1) {
    t.mock.timers.tick(MINUTE);
    state.target.dispatchEvent(new Event(events[minute % events.length]));
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.deepEqual(state.ended, []);
  assert.ok(state.renewed.length > 0);
  assert.ok(tokenTimes(state.session().token).expiresAt > START + 40 * MINUTE);
  assert.equal(state.session().lastActivity, START + 40 * MINUTE);
});

test("input after sleep cannot reset an already elapsed deadline", (t) => {
  const state = setup(t);
  t.mock.timers.setTime(START + INACTIVITY_TIMEOUT_MS);
  state.target.dispatchEvent(new Event("pointermove"));
  assert.deepEqual(state.ended, ["inactive"]);
  assert.equal(state.session(), null);
});

test("focus and visibility checks do not count as activity", (t) => {
  const state = setup(t);
  t.mock.timers.setTime(START + 20 * MINUTE);
  state.target.dispatchEvent(new Event("visibilitychange"));
  state.target.dispatchEvent(new Event("focus"));
  assert.equal(state.session().lastActivity, START);
  t.mock.timers.setTime(START + 30 * MINUTE);
  state.target.dispatchEvent(new Event("pageshow"));
  assert.deepEqual(state.ended, ["inactive"]);
});

test("renewal failures are surfaced once, and never extend token expiry", async (t) => {
  const failure = new Error("Offline");
  const state = setup(t, failure);
  t.mock.timers.tick(MINUTE);
  state.target.dispatchEvent(new Event("keydown"));
  for (let minute = 0; minute < 3; minute += 1) {
    t.mock.timers.tick(MINUTE);
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.deepEqual(state.errors, [failure]);
  assert.equal(state.session().token, token());
  t.mock.timers.setTime(START + INACTIVITY_TIMEOUT_MS);
  state.target.dispatchEvent(new Event("focus"));
  assert.deepEqual(state.ended, ["expired"]);
});

test("restored sessions retain their original inactivity deadline", () => {
  const restored = { token: token(START + 5 * MINUTE), lastActivity: START + 10 * MINUTE };
  assert.equal(sessionEndReason(restored, START + 20 * MINUTE), null);
  assert.equal(sessionEndReason(restored, START + 40 * MINUTE), "inactive");
});
