import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/authContextValue";
import { getApiErrorMessage } from "../../jobs/jobApi";
import { notificationsQueryKey } from "../../notifications/notificationQueries";
import { getChat, getMessages, markChatRead, sendMessage } from "../chatApi";

export default function ChatPage() {
  const { applicationId } = useParams();
  const id = Number(applicationId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return <p role="alert">Invalid chat address.</p>;
  }
  return <Conversation key={id} applicationId={id} />;
}

function Conversation({ applicationId }: { applicationId: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [readError, setReadError] = useState<string | null>(null);
  const lastReadId = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const chatQuery = useQuery({
    queryKey: ["chats", user!.email, applicationId],
    queryFn: () => getChat(applicationId),
    refetchInterval: 5_000,
  });
  const messagesKey = ["chats", user!.email, applicationId, "messages"] as const;
  const messagesQuery = useInfiniteQuery({
    // The API returns newest-first cursor pages; flattening below reverses them for chronological display.
    queryKey: messagesKey,
    queryFn: ({ pageParam }) => getMessages(applicationId, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (page) => page.hasMore ? page.items.at(-1)?.id : undefined,
    enabled: !!chatQuery.data && !chatQuery.error,
    refetchInterval: 5_000,
  });
  const send = useMutation({
    mutationFn: (body: string) => sendMessage(applicationId, body),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: messagesKey });
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["chats", user!.email, applicationId],
      });
    },
  });
  const newestId = messagesQuery.data?.pages[0]?.items[0]?.id ?? 0;
  const pages = messagesQuery.data?.pages;
  const resetSend = send.reset;

  useEffect(() => {
    if (chatQuery.data?.canSendMessages) resetSend();
  }, [chatQuery.data?.canSendMessages, resetSend]);

  useEffect(() => {
    if (!newestId) return;
    end.current?.scrollIntoView({ block: "nearest" });
  }, [newestId]);

  useEffect(() => {
    let active = true;
    let pending = false;
    // Acknowledge only through the newest loaded message while this conversation is visible.
    async function readVisibleMessages() {
      if (document.visibilityState !== "visible" || !pages || !newestId
          || newestId <= lastReadId.current || pending) return;
      pending = true;
      try {
        await markChatRead(applicationId, newestId);
        if (active) {
          lastReadId.current = newestId;
          setReadError(null);
          await queryClient.invalidateQueries({
            queryKey: notificationsQueryKey(user!.email, user!.role),
          });
        }
      } catch (error) {
        if (active) setReadError(getApiErrorMessage(error, "Unable to mark messages as read."));
      } finally {
        pending = false;
      }
    }
    void readVisibleMessages();
    document.addEventListener("visibilitychange", readVisibleMessages);
    window.addEventListener("focus", readVisibleMessages);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", readVisibleMessages);
      window.removeEventListener("focus", readVisibleMessages);
    };
  }, [applicationId, newestId, pages, queryClient, user]);

  const error = chatQuery.error ?? messagesQuery.error;
  const chat = chatQuery.data;
  const messages = pages?.flatMap((page) => page.items).reverse() ?? [];
  return (
    <section className="mx-auto max-w-[900px] py-8 pb-16">
      <Link to={`/${user!.role.toLowerCase()}/messages`} className="text-sky-300">Back to messages</Link>
      <h1 className="mt-4 break-words">{chat?.jobTitle ?? "Job chat"}</h1>
      {chat && <p className="break-words">Chat with {user!.role === "EMPLOYEE" ? chat.companyName : chat.employeeName}</p>}
      {chat?.jobClosed && <p className="text-amber-200">This job is closed. Its conversation history remains available.</p>}
      <p className="text-sm text-slate-400">Share only details you are comfortable disclosing. You can send email addresses, phone numbers, or CV links; file uploads are not supported.</p>
      {(chatQuery.isLoading || messagesQuery.isLoading) && <p>Loading conversation...</p>}
      {error && <div role="alert" className="my-4 rounded-xl border border-red-400/40 p-4 text-red-200">
        <p>{getApiErrorMessage(error, "Unable to load this chat. The job may have been deleted.")}</p>
        <button type="button" onClick={() => {
          void chatQuery.refetch();
          void messagesQuery.refetch();
        }}>Try again</button>
      </div>}
      {chat && !error && <>
        <div className="max-h-[55vh] min-h-52 overflow-y-auto rounded-2xl border border-slate-400/25 bg-slate-900/90 p-4">
          {messagesQuery.hasNextPage && <button type="button"
            className="mb-4 text-sky-300" disabled={messagesQuery.isFetchingNextPage}
            onClick={() => void messagesQuery.fetchNextPage()}>
            {messagesQuery.isFetchingNextPage ? "Loading..." : "Load older messages"}
          </button>}
          {!messagesQuery.isLoading && messages.length === 0 && <p>{chat.canSendMessages ? "No messages yet. Start the conversation below." : "No messages were exchanged."}</p>}
          <ol aria-label="Conversation messages" className="m-0 grid list-none gap-3 p-0">
            {messages.map((message) => <li key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.mine ? "justify-self-end bg-blue-700" : "justify-self-start bg-slate-800"}`}>
              <p className="mb-1 text-xs font-bold text-slate-300">{message.mine ? "You" : user!.role === "EMPLOYEE" ? chat.companyName : chat.employeeName}</p>
              <p className="m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-slate-100">{message.body}</p>
              <time className="mt-2 block text-xs text-slate-300" dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
            </li>)}
          </ol>
          <div ref={end} />
        </div>
        {readError && <p role="alert" className="text-red-200">{readError}</p>}
        {!chat.canSendMessages && (
          <p role="status" className="mt-5 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4 text-amber-200">
            This application was rejected. You can view previous messages, but messaging is disabled.
          </p>
        )}
        {chat.canSendMessages && <form className="mt-5 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          if (chat.canSendMessages && !send.isPending && draft.trim()) send.mutate(draft.trim());
        }}>
          <label htmlFor="chat-message" className="font-bold">Message</label>
          <textarea id="chat-message" rows={3} maxLength={5000} required
            value={draft} disabled={send.isPending} onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question about the role or share your contact details..." />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">{draft.length}/5000</span>
            <button type="submit" disabled={send.isPending || !draft.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50">
              {send.isPending ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>}
        {send.error && <p role="alert" className="text-red-200">{getApiErrorMessage(send.error, "Unable to send message. Your draft has been kept.")}</p>}
      </>}
    </section>
  );
}
