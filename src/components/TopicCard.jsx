import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function TopicCard({
  topic,
  currentUserId,
  userVote,
  onDelete,
  onVote,
  onRefresh,
  readOnly = false
}) {
  const { user } = useAuth();
  // const isOwner = topic.user_id === currentUserId;
  const isOwner = topic.user_id === currentUserId && !readOnly
  const isExpired =
    topic.voting_ends_at && new Date(topic.voting_ends_at) < new Date();
  const score = topic.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0;

  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(topic.event_date?.split("T")[0] ?? "");

  const statusList = ["proposed", "retained", "done"];
  const statusLabel = {
    proposed: "Proposé",
    retained: "Retenu",
    done: "Terminé",
  };
  // const statusClass = {
  //   proposed: "bg-[#a8a3e3] text-[#363b6c]",
  //   retained: "bg-[#7c75d8] text-[#eaedfe]",
  //   done: "bg-[#363b6c] text-[#eaedfe]",
  // };

  async function toggleExpand() {
    if (!expanded) {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(username)")
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
    }
    setExpanded(!expanded);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    await supabase.from("comments").insert({
      topic_id: topic.id,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment("");
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("topic_id", topic.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  }

  async function handleDeleteComment(commentId) {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function handleStatusChange(e) {
    const newStatus = e.target.value;

    await supabase
      .from("topics")
      .update({ status: newStatus })
      .eq("id", topic.id);
    onRefresh();
  }

  async function handleDateSave() {
    await supabase
      .from("topics")
      .update({ event_date: newDate || null })
      .eq("id", topic.id);
    setEditingDate(false);
    onRefresh();
  }

  function handleVote(value) {
    if (isExpired) return;
    if (userVote?.value === value) {
      onVote(topic.id, null, userVote.id);
    } else {
      onVote(topic.id, value, userVote?.id ?? null);
    }
  }

  return (
    <div className="bg-white border border-periwinkle rounded-xl overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-indigo-deep font-medium text-sm">
              {topic.title}
            </p>
            {topic.description && (
              <p className="text-violet-soft text-xs mt-1">
                {topic.description}
              </p>
            )}
          </div>
          {isOwner ? (
            <select
              value={topic.status}
              onChange={handleStatusChange}
              style={{
                background:
                  topic.status === "proposed"
                    ? "#a8a3e3"
                    : topic.status === "retained"
                      ? "#7c75d8"
                      : "#363b6c",
                color: topic.status === "proposed" ? "#363b6c" : "#eaedfe",
              }}
              className="text-xs px-2 py-1 rounded-full border-none outline-none cursor-pointer"
            >
              {statusList.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                background:
                  topic.status === "proposed"
                    ? "#a8a3e3"
                    : topic.status === "retained"
                      ? "#7c75d8"
                      : "#363b6c",
                color: topic.status === "proposed" ? "#363b6c" : "#eaedfe",
              }}
              className="text-xs px-2 py-1 rounded-full shrink-0"
            >
              {statusLabel[topic.status]}
            </span>
          )}
        </div>

        {/* Date événement */}
        <div className="flex items-center gap-2 text-xs text-violet-soft">
          {editingDate ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border border-periwinkle rounded-lg px-2 py-1 text-xs outline-none text-indigo-deep"
              />
              <button
                onClick={handleDateSave}
                className="text-violet-cta cursor-pointer"
              >
                Sauver
              </button>
              <button
                onClick={() => setEditingDate(false)}
                className="text-violet-soft cursor-pointer"
              >
                Annuler
              </button>
            </div>
          ) : (
            <>
              <span>
                {topic.event_date
                  ? `Événement : ${new Date(topic.event_date).toLocaleDateString("fr-FR")}`
                  : "Pas de date"}
              </span>
              {isOwner && (
                <button
                  onClick={() => setEditingDate(true)}
                  className="text-violet-cta cursor-pointer hover:underline"
                >
                  Modifier
                </button>
              )}
            </>
          )}
        </div>

        {/* Votes + meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(1)}
              disabled={isExpired}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-colors
                ${userVote?.value === 1 ? "bg-violet-cta text-white border-violet-cta" : "bg-transparent text-violet-soft border-periwinkle hover:border-violet-cta hover:text-violet-cta"}
                ${isExpired ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              ▲
            </button>
            <span className="text-xs text-violet-soft font-medium min-w-6 text-center">
              {score > 0 ? `+${score}` : score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={isExpired}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-colors
                ${userVote?.value === -1 ? "bg-indigo-deep text-lavender border-indigo-deep" : "bg-transparent text-violet-soft border-periwinkle hover:border-indigo-deep hover:text-indigo-deep"}
                ${isExpired ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              ▼
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-violet-soft">
            <span>par {topic.profiles?.username}</span>
            {isExpired && <span className="text-periwinkle">· Vote fermé</span>}
            <button
              onClick={toggleExpand}
              className="text-violet-cta cursor-pointer hover:underline"
            >
              {expanded ? "Masquer" : `Commentaires`}
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(topic.id)}
                className="hover:text-indigo-deep cursor-pointer"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section commentaires */}
      {expanded && (
        <div className="border-t border-periwinkle bg-lavender px-4 py-3 flex flex-col gap-3">
          {comments.length === 0 ? (
            <p className="text-xs text-violet-soft text-center py-2">
              Aucun commentaire
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-medium text-indigo-deep">
                      {comment.profiles?.username}{" "}
                    </span>
                    <span className="text-xs text-indigo-deep/80">
                      {comment.content}
                    </span>
                  </div>
                  {comment.user_id === user.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-violet-soft hover:text-indigo-deep cursor-pointer shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-periwinkle text-xs outline-none bg-white text-indigo-deep placeholder:text-violet-soft"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-violet-cta text-white rounded-lg text-xs cursor-pointer"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
