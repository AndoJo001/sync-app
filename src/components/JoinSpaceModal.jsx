import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function JoinSpaceModal({ onClose, onJoined }) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
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
  async function handleJoin(e) {
    e.preventDefault();
    setError(null);

    const { data: space, error: findError } = await supabase
      .from("spaces")
      .select("id")
      .eq("access_code", code.toUpperCase())
      .single();

    if (findError || !space) {
      setError("Code invalide");
      return;
    }

    const { error: joinError } = await supabase
      .from("space_members")
      .insert({ space_id: space.id, user_id: user.id });

    if (joinError) {
      setError("Tu es déjà membre de cet espace");
      return;
    }

    onJoined();
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
        <h3
          style={{
            color: "#363b6c",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          Rejoindre un espace
        </h3>

        {error && (
          <p
            style={{ color: "#e53e3e", fontSize: "13px", marginBottom: "1rem" }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleJoin}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Code d'accès (ex: AB12CD)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #c6c9e7",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              // textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "10px",
                background: "transparent",
                color: "#363b6c",
                border: "1px solid #c6c9e7",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px",
                background: "#7c75d8",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Rejoindre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
