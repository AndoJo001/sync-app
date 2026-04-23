import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { User, Lock, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username ?? "");
  // const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  async function handleUpdateUsername(e) {
    e.preventDefault();
    setLoadingUsername(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    setLoadingUsername(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }
    await fetchProfile(user.id);
    showToast("Nom d'utilisateur mis à jour");
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setLoadingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoadingPassword(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }
    // setCurrentPassword("");
    setNewPassword("");
    showToast("Mot de passe mis à jour");
  }

  return (
    <Layout title="Profil">
      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-violet-cta flex justify-start items-center gap-2 text-sm text-center cursor-pointer hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={18}/> <span>Retour</span>
        </button>
        {/* Card username */}
        <div className="bg-white rounded-2xl border border-periwinkle shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-periwinkle">
            <User size={16} className="text-violet-cta" />
            <h2 className="text-indigo-deep font-semibold text-sm">
              Nom d'utilisateur
            </h2>
          </div>
          <form
            onSubmit={handleUpdateUsername}
            className="px-5 py-4 flex flex-col gap-3"
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors text-indigo-deep"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-violet-soft">{user?.email}</span>
              <button
                type="submit"
                disabled={loadingUsername}
                className="px-4 py-2 bg-violet-cta text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {loadingUsername ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>

        {/* Card mot de passe */}
        <div className="bg-white rounded-2xl border border-periwinkle shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-periwinkle">
            <Lock size={16} className="text-violet-cta" />
            <h2 className="text-indigo-deep font-semibold text-sm">
              Mot de passe
            </h2>
          </div>
          <form
            onSubmit={handleUpdatePassword}
            className="px-5 py-4 flex flex-col gap-3"
          >
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors text-indigo-deep"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingPassword}
                className="px-4 py-2 bg-violet-cta text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {loadingPassword ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
