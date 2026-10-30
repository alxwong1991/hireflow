import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/authContextValue";
import { getApiErrorMessage } from "../../jobs/jobApi";
import { getChats } from "../chatApi";

export default function ChatsPage() {
  const { user } = useAuth();
  const rolePath = user!.role.toLowerCase();
  const query = useQuery({
    queryKey: ["chats", user!.email],
    queryFn: getChats,
    refetchInterval: 30_000,
  });

  return (
    <section className="mx-auto max-w-[1000px] py-10 pb-16">
      <h1>Messages</h1>
      <p>Discuss the role, ask questions, and share contact details or CV links privately.</p>
      <p className="text-sm text-slate-400">Chat unlocks when an application is Reviewing, Shortlisted, or Accepted. Rejected applications keep their chat history, but messaging is disabled until the application is reopened. Closing a job preserves chats; deleting it permanently removes them.</p>
      {query.isLoading && <p>Loading chats...</p>}
      {query.error && (
        <div role="alert" className="my-4 rounded-xl border border-red-400/40 p-4 text-red-200">
          <p>{getApiErrorMessage(query.error, "Unable to load chats.")}</p>
          <button type="button" onClick={() => void query.refetch()}>Try again</button>
        </div>
      )}
      {!query.isLoading && !query.error && query.data?.length === 0 && <p>No chats yet. Eligible applications will appear here.</p>}
      <div className="grid gap-4">
        {query.data?.map((chat) => (
          <Link key={chat.applicationId} to={`/${rolePath}/messages/${chat.applicationId}`}
            className="rounded-2xl border border-slate-400/25 bg-slate-900 p-5 hover:border-sky-400">
            <h2 className="break-words">{chat.jobTitle}</h2>
            <p className="break-words">{user!.role === "EMPLOYEE" ? chat.companyName : chat.employeeName}</p>
            <span className="text-sm text-slate-400">{chat.status.toLowerCase()}{chat.jobClosed ? " - Job closed" : ""}</span>
            {!chat.canSendMessages && <span className="ml-3 text-sm text-amber-200">Read-only</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
