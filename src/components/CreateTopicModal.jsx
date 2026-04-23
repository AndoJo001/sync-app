import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function CreateTopicModal({ spaceId, onClose, onCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [votingDays, setVotingDays] = useState(3);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + Number(votingDays));

    const { error: insertError } = await supabase.from("topics").insert({
      title,
      description: description || null,
      space_id: spaceId,
      user_id: user.id,
      event_date: eventDate || null,
      voting_ends_at: votingEndsAt.toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onCreated();
    // onClose();
    handleClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{
        background: `rgba(54,59,108,${visible ? "0.5" : "0"})`,
        transition: "background 0.25s ease",
      }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <h3 className="text-indigo-deep font-semibold text-base mb-4">
          Proposer un topic
        </h3>

        {error && (
          <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Titre du topic"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-2.5 rounded-lg border border-periwinkle text-sm outline-none bg-white text-indigo-deep placeholder:text-violet-soft"
          />
          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="px-4 py-2.5 rounded-lg border border-periwinkle text-sm outline-none bg-white text-indigo-deep placeholder:text-violet-soft resize-none"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-violet-soft">
              Date de l'événement (optionnel)
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-periwinkle text-sm outline-none bg-white text-indigo-deep"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-violet-soft">
              Fermeture des votes dans
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setVotingDays(d)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer"
                  style={
                    votingDays === d
                      ? {
                          background: "#7c75d8",
                          color: "#eaedfe",
                          borderColor: "#7c75d8",
                        }
                      : {
                          background: "transparent",
                          color: "#a8a3e3",
                          borderColor: "#c6c9e7",
                        }
                  }
                >
                  {d}j
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 bg-transparent text-indigo-deep border border-periwinkle rounded-lg text-sm cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-violet-cta text-white border-none rounded-lg text-sm cursor-pointer"
            >
              Proposer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
