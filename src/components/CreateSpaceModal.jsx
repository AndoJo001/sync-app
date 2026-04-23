import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateSpaceModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
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
    const code = generateCode();

    const { data, error: spaceError } = await supabase
      .from("spaces")
      .insert({ name, access_code: code, owner_id: user.id })
      .select()
      .single();

    if (spaceError) {
      setError(spaceError.message);
      return;
    }

    await supabase
      .from("space_members")
      .insert({ space_id: data.id, user_id: user.id });

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
        <h3
          style={{
            color: "#363b6c",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          Créer un espace
        </h3>

        {error && (
          <p
            style={{ color: "#e53e3e", fontSize: "13px", marginBottom: "1rem" }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Nom de l'espace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #c6c9e7",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
            }}
          />
          <p style={{ fontSize: "12px", color: "#a8a3e3" }}>
            Un code d'accès unique sera généré automatiquement
          </p>
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
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
