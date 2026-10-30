import assert from "node:assert/strict";
import { test } from "node:test";
import {
  removeNotification,
  invalidateTargetQueries,
  isNotificationTargetValid,
  unreadCountLabel,
  unreadBadgeText,
  updateNotificationRead,
} from "../src/features/notifications/notificationUtils.ts";

const notification = (id, read = false) => ({
  id,
  message: `Notification ${id}`,
  targetPath: "/employee/applications#application-1",
  createdAt: "2026-10-30T00:00:00Z",
  read,
});

const makeData = () => ({
  pages: [
    { items: [notification(1), notification(2, true)], unreadCount: 1, hasMore: true },
    { items: [notification(3)], unreadCount: 1, hasMore: false },
  ],
  pageParams: [0, 1],
});

test("badge display caps visually while retaining the exact accessible count elsewhere", () => {
  assert.equal(unreadBadgeText(0), "0");
  assert.equal(unreadBadgeText(99), "99");
  assert.equal(unreadBadgeText(100), "99+");
  assert.equal(unreadCountLabel(100), "Notifications, 100 unread");
});

test("notification destinations are constrained to the signed-in role's supported routes", () => {
  assert.equal(
    isNotificationTargetValid(
      "/employee/applications#application-42",
      "EMPLOYEE",
    ),
    true,
  );
  assert.equal(
    isNotificationTargetValid("/employer/jobs/7/applications", "EMPLOYER"),
    true,
  );
  assert.equal(
    isNotificationTargetValid("https://example.com", "EMPLOYEE"),
    false,
  );
  assert.equal(
    isNotificationTargetValid("/employer/jobs/7/applications", "EMPLOYEE"),
    false,
  );
});

test("marking a notification read decrements the page-zero count only once", () => {
  const updated = { ...notification(1, true), message: "Updated" };
  const afterFirstRead = updateNotificationRead(makeData(), updated);
  assert.equal(afterFirstRead.pages[0].unreadCount, 0);
  assert.deepEqual(afterFirstRead.pages[0].items[0], updated);

  const afterRepeatedRead = updateNotificationRead(afterFirstRead, updated);
  assert.equal(afterRepeatedRead.pages[0].unreadCount, 0);
});

test("chat notification destinations are role-specific and require positive application IDs", () => {
  for (const [role, prefix] of [["EMPLOYEE", "employee"], ["EMPLOYER", "employer"]]) {
    assert.equal(isNotificationTargetValid(`/${prefix}/messages/42`, role), true);
    for (const suffix of ["0", "-1", "42/extra", "42?redirect=https://example.com"]) {
      assert.equal(isNotificationTargetValid(`/${prefix}/messages/${suffix}`, role), false);
    }
    const otherPrefix = prefix === "employee" ? "employer" : "employee";
    assert.equal(isNotificationTargetValid(`/${otherPrefix}/messages/42`, role), false);
  }
});

test("opening a chat notification invalidates chat data before navigating", async () => {
  const invalidations = [];
  const client = {
    invalidateQueries: async (filter) => { invalidations.push(filter); },
  };
  await Promise.all(invalidateTargetQueries(client, "/employee/messages/42", "EMPLOYEE"));
  assert.deepEqual(invalidations, [{ queryKey: ["chats"] }]);
});

test("deleting a read notification removes it without changing unread counts", () => {
  const result = removeNotification(makeData(), 2);
  assert.deepEqual(result.pages[0].items.map(({ id }) => id), [1]);
  assert.equal(result.pages[0].unreadCount, 1);
  assert.equal(result.pages[1].items.length, 1);
});
