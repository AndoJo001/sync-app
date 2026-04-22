import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  proposed: { label: "Proposé", bg: "#a8a3e3", color: "#363b6c" },
  retained: { label: "Retenu", bg: "#7c75d8", color: "#eaedfe" },
  done: { label: "Terminé", bg: "#363b6c", color: "#eaedfe" },
};

export default function TopicCard({
  topic,
  currentUserId,
  userVote,
  onDelete,
  onVote,
  onRefresh,
  readOnly = false,
}) {
  const { user } = useAuth();
  const isOwner = topic.user_id === currentUserId && !readOnly;
  const isExpired =
    topic.voting_ends_at && new Date(topic.voting_ends_at) < new Date();
  const score = topic.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0;

  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(topic.event_date?.split("T")[0] ?? "");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  async function handleStatusChange(newStatus) {
    await supabase
      .from("topics")
      .update({ status: newStatus })
      .eq("id", topic.id);
    setShowStatusMenu(false);
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
    onVote(topic.id, value);
  }

  const currentStatus = STATUS_CONFIG[topic.status];

  return (
    // <div className="bg-white border border-periwinkle rounded-2xl shadow-sm overflow-hidden">
    <div className="bg-white rounded-2xl overflow-hidden border border-periwinkle shadow-sm hover:border-violet-soft transition-colors flex">
      <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: currentStatus.bg }} />

      <div className="flex-1 min-w-0">
        <div className="p-5 flex flex-col gap-4">
          {/* Header — titre + badge statut */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-indigo-deep font-semibold text-base leading-snug">
                {topic.title}
              </p>
              {topic.description && (
                <p className="text-violet-soft text-sm mt-1.5 leading-relaxed">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Badge statut — cliquable si owner, sinon fixe */}
            <div className="relative shrink-0">
              <button
                onClick={() => isOwner && setShowStatusMenu(!showStatusMenu)}
                style={{
                  background: currentStatus.bg,
                  color: currentStatus.color,
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${isOwner ? "cursor-pointer" : "cursor-default"}`}
              >
                {currentStatus.label} {isOwner && "▾"}
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 top-8 bg-white border border-periwinkle rounded-xl overflow-hidden z-10 w-32 shadow-sm">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(key)}
                      className={`w-full text-left px-3 py-2 text-xs cursor-pointer hover:bg-lavender transition-colors
                      ${topic.status === key ? "font-semibold" : ""}`}
                      style={{
                        color: key === topic.status ? config.bg : "#363b6c",
                      }}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Infos — auteur + date événement */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-violet-soft">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full bg-periwinkle flex items-center justify-center text-indigo-deep font-semibold"
                  style={{ fontSize: "10px" }}
                >
                  {topic.profiles?.username?.[0]?.toUpperCase()}
                </div>
                <span>{topic.profiles?.username}</span>
              </div>

              {topic.event_date && (
                <span className="flex items-center gap-1">
                  <span>·</span>
                  <span>
                    {new Date(topic.event_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
              )}

              {isExpired && (
                <span className="text-periwinkle">· Vote fermé</span>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => setEditingDate(!editingDate)}
                className="text-xs text-violet-cta cursor-pointer hover:underline shrink-0"
              >
                {editingDate
                  ? "Annuler"
                  : topic.event_date
                    ? "Modifier date"
                    : "Ajouter date"}
              </button>
            )}
          </div>

          {/* Champ modification date */}
          {editingDate && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border border-periwinkle rounded-lg px-3 py-1.5 text-xs outline-none text-indigo-deep bg-lavender"
              />
              <button
                onClick={handleDateSave}
                className="px-3 py-1.5 bg-violet-cta text-white rounded-lg text-xs cursor-pointer"
              >
                Sauver
              </button>
            </div>
          )}

          {/* Footer — votes + actions */}
          <div className="flex items-center justify-between pt-1 border-t border-periwinkle/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(1)}
                disabled={isExpired}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                ${
                  userVote?.value === 1
                    ? "bg-violet-cta text-white border-violet-cta"
                    : "bg-transparent text-violet-soft border-periwinkle hover:border-violet-cta hover:text-violet-cta"
                }
                ${isExpired ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                ▲
              </button>
              <span
                className="text-sm font-semibold min-w-8 text-center"
                style={{
                  color:
                    score > 0 ? "#7c75d8" : score < 0 ? "#a8a3e3" : "#c6c9e7",
                }}
              >
                {score > 0 ? `+${score}` : score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                disabled={isExpired}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                ${
                  userVote?.value === -1
                    ? "bg-indigo-deep text-lavender border-indigo-deep"
                    : "bg-transparent text-violet-soft border-periwinkle hover:border-indigo-deep hover:text-indigo-deep"
                }
                ${isExpired ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                ▼
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleExpand}
                className="text-xs text-violet-soft hover:text-violet-cta cursor-pointer transition-colors flex items-center gap-1"
              >
                <span>{comments.length > 0 ? comments.length : ""}</span>
                <span>{expanded ? "Masquer" : "Commentaires"}</span>
              </button>
              {isOwner && (
                <button
                  onClick={() => onDelete(topic.id)}
                  className="text-xs text-periwinkle hover:text-red-400 cursor-pointer transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section commentaires */}
      {expanded && (
        <div className="border-t border-periwinkle bg-lavender px-5 py-4 flex flex-col gap-3">
          {comments.length === 0 ? (
            <p className="text-xs text-violet-soft text-center py-2">
              Aucun commentaire — sois le premier
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-5 h-5 rounded-full bg-periwinkle flex items-center justify-center text-indigo-deep font-semibold shrink-0 mt-0.5"
                      style={{ fontSize: "10px" }}
                    >
                      {comment.profiles?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-indigo-deep">
                        {comment.profiles?.username}{" "}
                      </span>
                      <span className="text-xs text-indigo-deep/70">
                        {comment.content}
                      </span>
                    </div>
                  </div>
                  {comment.user_id === user.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs flex items-center text-periwinkle hover:text-red-400 cursor-pointer shrink-0 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-periwinkle text-xs outline-none bg-white text-indigo-deep placeholder:text-violet-soft"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-violet-cta text-white rounded-lg text-xs cursor-pointer font-medium"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
