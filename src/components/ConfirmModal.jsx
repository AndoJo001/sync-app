export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-indigo-deep/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-sm">
        <p className="text-indigo-deep text-sm font-medium text-center">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
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
  )
}