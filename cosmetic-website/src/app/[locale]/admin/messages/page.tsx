import { requireAdmin } from "@/lib/auth";
import { getAdminMessages } from "@/lib/data/admin-content";
import { formatDateTime } from "@/lib/format";
import MessageActions from "@/components/admin/MessageActions";

export default async function AdminMessagesPage() {
  await requireAdmin("/admin/messages");
  const messages = await getAdminMessages();
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        {messages.length} messages, {unread} unread. Messages from the Contact page.
      </p>

      <div className="space-y-4">
        {messages.length === 0 && (
          <p className="rounded-2xl bg-white py-16 text-center text-muted">No messages yet.</p>
        )}
        {messages.map((m) => (
          <article
            key={m.id}
            className={`rounded-2xl border p-5 ${
              m.is_read ? "border-line bg-white" : "border-brand bg-brand-soft/30"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.name}
                  {!m.is_read && (
                    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
              </div>
              <p className="text-xs text-muted">{formatDateTime(m.created_at)} (KST)</p>
            </div>
            {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
            <p className="mt-2 text-sm whitespace-pre-wrap">{m.message}</p>
            <div className="mt-4 border-t border-line pt-4">
              <MessageActions id={m.id} isRead={m.is_read} email={m.email} subject={m.subject} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}