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
    <div className="min-h-screen bg-indigo-deep flex justify-center items-center">
      <div className="bg-lavender rounded-2xl p-8 w-full max-w-100">
        <h1 className="text-indigo-deep text-2xl font-semibold mb-1">Sync</h1>
        <p className="text-violet-cta text-sm mb-6">Crée ton compte</p>

        {error && (
          <p className="text-[#e53e3e] text-[13px] mb-4 bg-[#fff5f5] py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-lg border border-periwinkle text-sm outline-none bg-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-lg border border-periwinkle text-sm outline-none bg-white"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-lg border border-periwinkle text-sm outline-none bg-white"
          />
          <button
            type="submit"
            className="p-2.5 rounded-lg bg-violet-cta text-white text-sm font-medium cursor-pointer"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-sm text-indigo-deep mt-4 text-center">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-violet-cta font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
