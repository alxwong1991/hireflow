import assert from "node:assert/strict";
import { test } from "node:test";
import { profilePathForRole } from "../src/features/auth/authRoutes.ts";

test("employees and employers are redirected to their own profile after login", () => {
  assert.equal(profilePathForRole("EMPLOYEE"), "/employee/profile");
  assert.equal(profilePathForRole("EMPLOYER"), "/employer/profile");
});
