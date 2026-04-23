import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateSpaceModal from "../components/CreateSpaceModal";
import JoinSpaceModal from "../components/JoinSpaceModal";
import NotificationBell from "../components/NotificationBell";
import ConfirmModal from "../components/ConfirmModal"
import Layout from "../components/Layout";
import { useLoader } from "../context/LoadingContext";

export default function SpacesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function fetchSpaces() {
    showLoader();
    const { data } = await supabase
      .from("space_members")
      .select("space_id, spaces(id, name, owner_id)")
      .eq("user_id", user.id);
    if (data) setSpaces(data.map((d) => d.spaces));
    hideLoader();
  }

  // async function handleDeleteSpace(e, spaceId) {
  //   e.stopPropagation();
  //   await supabase.from("spaces").delete().eq("id", spaceId);
  //   fetchSpaces();
  // }

  async function handleDeleteSpace(spaceId) {
    await supabase.from("spaces").delete().eq("id", spaceId);
    fetchSpaces();
  }

  useEffect(() => {
    fetchSpaces();
  }, []);

  return (
    <Layout>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-deep font-semibold text-lg">
            Mes espaces
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2 text-sm text-violet-cta border border-violet-cta rounded-lg cursor-pointer hover:bg-violet-cta hover:text-white transition-colors"
            >
              Rejoindre
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm bg-violet-cta text-white rounded-lg cursor-pointer"
            >
              Créer un espace
            </button>
          </div>
        </div>

        {spaces.length === 0 ? (
          <div className="text-center py-16 text-violet-soft">
            <p className="text-sm">
              Aucun espace pour l'instant ou veuillez patientez
            </p>
            <p className="text-xs mt-2">
              Crée un espace ou rejoins-en un avec un code
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() => navigate(`/space/${space.id}`)}
                className="bg-white border border-periwinkle rounded-2xl p-5 cursor-pointer hover:border-violet-cta transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-base shrink-0"
                    style={{ background: "#7c75d8" }}
                  >
                    {space.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-indigo-deep font-semibold text-sm">
                      {space.name}
                    </p>
                    <p className="text-violet-soft text-xs mt-0.5">
                      {space.owner_id === user.id ? "Administrateur" : "Membre"}
                    </p>
                  </div>
                </div>
                {/* <span className="text-periwinkle group-hover:text-violet-cta transition-colors text-lg">
                  →
                </span> */}
                <div className="flex items-center gap-3">
                  {space.owner_id === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(space.id);
                      }}
                      className="text-sm text-periwinkle hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                  <span className="text-periwinkle group-hover:text-violet-cta transition-colors text-sm">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateSpaceModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchSpaces}
        />
      )}
      {showJoin && (
        <JoinSpaceModal
          onClose={() => setShowJoin(false)}
          onJoined={fetchSpaces}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message="Supprimer cet espace ? Tous les topics et votes seront perdus."
          onConfirm={() => {
            handleDeleteSpace(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Layout>
  );
}
