import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";
import { User } from "lucide-react";

export default function Layout({
  children,
  showBack = false,
  title = "Sync",
  subtitle = null,
}) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-deep px-10 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {showBack && (
            <>
              <button
                onClick={() => navigate("/")}
                className="text-periwinkle text-sm cursor-pointer hover:text-lavender transition-colors"
              >
                ← Espaces
              </button>
              <span className="text-periwinkle/30">|</span>
            </>
          )}
          <div>
            <h1 className="text-lavender font-semibold text-xl leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-violet-soft text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => navigate("/profile")}
            className="hidden sm:flex items-center gap-1.5 text-violet-soft text-xs hover:text-lavender transition-colors cursor-pointer"
          >
            <User size={13} />
            <span>{profile?.username ?? user?.email}</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-periwinkle border border-violet-soft/30 rounded-lg cursor-pointer hover:text-lavender transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
