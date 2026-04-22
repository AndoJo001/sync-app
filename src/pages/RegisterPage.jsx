import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username });

    if (profileError) {
      setError(profileError.message);
      return;
    }

    navigate("/");
  }

  return (
  <div className="min-h-screen bg-indigo-deep flex justify-center items-center px-4">
    <div className="w-full max-w-sm">

      <div className="text-center mb-8">
        <h1 className="text-lavender text-3xl font-bold tracking-tight">Sync</h1>
        <p className="text-violet-soft text-sm mt-1">Crée ton compte</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-violet-cta text-white text-sm font-medium cursor-pointer mt-1"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-xs text-violet-soft mt-4 text-center">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-violet-cta font-medium">Se connecter</Link>
        </p>
      </div>

    </div>
  </div>
)
}
