import { useEffect, useState } from "react";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  const [visible, setVisible] = useState(false);

  function handleClose() {
    setVisible(false);
    setTimeout(onCancel, 250);
  }

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

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
        <p className="text-indigo-deep text-sm font-medium text-center">
          {message}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-periwinkle text-violet-soft text-sm cursor-pointer hover:border-violet-soft transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-400 text-white text-sm cursor-pointer font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
