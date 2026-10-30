import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContextValue";
import { getApiErrorMessage } from "../../jobs/jobApi";
import { deleteNotification, markNotificationRead } from "../notificationApi";
import {
  notificationsQueryKey,
  useNotifications,
} from "../notificationQueries";
import type { NotificationsData } from "../notificationQueries";
import {
  invalidateTargetQueries,
  isNotificationTargetValid,
  removeNotification,
  updateNotificationRead,
} from "../notificationUtils";
import type NotificationResponse from "../types/notificationResponse";

function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsQuery = useNotifications(user!.email, user!.role);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    notificationsQuery;
  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const queryKey = notificationsQueryKey(user!.email, user!.role);

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationsData>(queryKey, (current) =>
        updateNotificationRead(current, updated),
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await deleteNotification(notificationId);
      return notificationId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<NotificationsData>(queryKey, (current) =>
        removeNotification(current, deletedId),
      );
    },
  });

  async function handleOpen(notification: NotificationResponse) {
    setActionError(null);
    if (!isNotificationTargetValid(notification.targetPath, user!.role)) {
      setActionError("This notification has an invalid destination.");
      return;
    }
    try {
      await queryClient.cancelQueries({ queryKey });
      // Mark read before navigation, then refresh the destination's data so it reflects the notification.
      if (!notification.read) {
        await readMutation.mutateAsync(notification.id);
      }
      await Promise.all(
        invalidateTargetQueries(queryClient, notification.targetPath, user!.role),
      );
      navigate(notification.targetPath);
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "Unable to open this notification."),
      );
    }
  }

  async function handleDelete(notification: NotificationResponse) {
    if (!notification.read) return;
    setActionError(null);
    try {
      await queryClient.cancelQueries({ queryKey });
      await deleteMutation.mutateAsync(notification.id);
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "Unable to delete this notification."),
      );
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <div className="mb-7">
        <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">
          Your updates
        </p>
        <h1>Notifications</h1>
        <p>Stay up to date on activity related to your HireFlow account.</p>
      </div>

      {actionError && (
        <p className="mb-4 rounded-xl border border-red-400/40 bg-red-950/50 p-4 text-red-200" role="alert">
          {actionError}
        </p>
      )}
      {isLoading && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">
          Loading notifications...
        </p>
      )}
      {!isLoading && error && (
        <div className="rounded-[20px] border border-red-400/40 bg-slate-900/90 p-8 text-center shadow-[0_24px_70px_rgb(0_0_0/30%)]">
          <p className="text-red-200" role="alert">
            {getApiErrorMessage(error, "Unable to load notifications.")}
          </p>
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700"
            onClick={() => void notificationsQuery.refetch()}
          >
            Try again
          </button>
        </div>
      )}
      {!isLoading && !error && notifications.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">
          You’re all caught up. There are no notifications yet.
        </p>
      )}

      <div className="grid gap-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`flex items-start justify-between gap-5 rounded-[20px] border p-5 shadow-[0_24px_70px_rgb(0_0_0/20%)] max-sm:flex-col ${
              notification.read
                ? "border-slate-400/20 bg-slate-900/65"
                : "border-sky-400/40 bg-slate-900/95"
            }`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 cursor-pointer text-left"
              aria-label={`${notification.read ? "" : "Unread notification: "}${notification.message}`}
              disabled={readMutation.isPending}
              onClick={() => void handleOpen(notification)}
            >
              <span className="mb-2 flex items-center gap-2">
                {!notification.read && (
                  <span
                    className="size-2 shrink-0 rounded-full bg-red-500"
                    aria-hidden="true"
                  />
                )}
                <span className="text-sm font-bold text-slate-100">
                  {notification.message}
                </span>
              </span>
              <time
                className="block text-xs text-slate-400"
                dateTime={notification.createdAt}
              >
                {new Date(notification.createdAt).toLocaleString()}
              </time>
            </button>
            {notification.read && (
              <button
                type="button"
                className="shrink-0 rounded-full border border-slate-400/25 px-3.5 py-2 text-sm font-bold text-slate-300 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deleteMutation.isPending}
                onClick={() => void handleDelete(notification)}
                aria-label={`Delete notification: ${notification.message}`}
              >
                Delete
              </button>
            )}
          </article>
        ))}
      </div>

      {error && data && (
        <p className="mt-4 text-sm text-red-200" role="alert">
          {getApiErrorMessage(error, "Unable to refresh notifications.")}
        </p>
      )}
      {hasNextPage && (
        <button
          type="button"
          className="mt-6 w-full rounded-[14px] border border-slate-400/25 bg-slate-400/10 px-5 py-3 font-bold text-slate-200 transition hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading more..." : "Load more"}
        </button>
      )}
    </section>
  );
}

export default NotificationsPage;
