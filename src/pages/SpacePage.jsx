import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import TopicCard from "../components/TopicCard";
import CreateTopicModal from "../components/CreateTopicModal";
import NotificationBell from "../components/NotificationBell";

export default function SpacePage() {
  const { spaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [topics, setTopics] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("topics");
  const [filterStatus, setFilterStatus] = useState("all");

  async function fetchSpace() {
    const { data } = await supabase
      .from("spaces")
      .select("id, name, access_code, owner_id")
      .eq("id", spaceId)
      .single();
    if (data) setSpace(data);
  }

  async function fetchTopics() {
    const { data } = await supabase
      .from("topics")
      .select("*, profiles(username), votes(id, value, user_id)")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: false });

    if (data) {
      setTopics(data);
      const votesMap = {};
      data.forEach((topic) => {
        const myVote = topic.votes?.find((v) => v.user_id === user.id);
        if (myVote) votesMap[topic.id] = myVote;
      });
      setUserVotes(votesMap);
    }
  }

  async function handleVote(topicId, value) {
    const { data: existingVotes } = await supabase
      .from("votes")
      .select("id, value")
      .eq("topic_id", topicId)
      .eq("user_id", user.id)
      .limit(1);

    const realExisting = existingVotes?.[0] ?? null;

    const intValue = parseInt(value);

    if (realExisting && realExisting.value === intValue) {
      await supabase.from("votes").delete().eq("id", realExisting.id);
    } else if (realExisting) {
      await supabase
        .from("votes")
        .update({ value: intValue })
        .eq("id", realExisting.id);
    } else {
      await supabase
        .from("votes")
        .insert({ topic_id: topicId, user_id: user.id, value: intValue });

      const topic = topics.find((t) => t.id === topicId);
      if (topic && topic.user_id !== user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        await supabase.from("notifications").insert({
          user_id: topic.user_id,
          message: `${profile?.username} a voté sur ton topic "${topic.title}"`,
        });
      }
    }

    await fetchTopics();
  }

  async function checkDateReminders() {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data } = await supabase
      .from("topics")
      .select("id, title, event_date, user_id")
      .eq("space_id", spaceId)
      .not("event_date", "is", null)
      .gte("event_date", now.toISOString())
      .lte("event_date", in48h.toISOString());

    if (!data || data.length === 0) return;

    for (const topic of data) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .ilike("message", `%rappel%${topic.title}%`)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          message: `Rappel : l'événement "${topic.title}" approche dans moins de 48h`,
        });
      }
    }
  }

  async function handleDelete(topicId) {
    await supabase.from("topics").delete().eq("id", topicId);
    fetchTopics();
  }

  useEffect(() => {
    fetchSpace();
    fetchTopics();
    checkDateReminders();
  }, [spaceId]);

  const getScore = (topic) =>
    topic.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0;

  const plannedTopics = [...topics]
    .filter((t) => filterStatus === "all" || t.status === filterStatus)
    .sort((a, b) => getScore(b) - getScore(a));

  const tabClass = (tab) =>
    `px-4 py-2 text-sm cursor-pointer border-b-2 transition-colors ${
      activeTab === tab
        ? "border-violet-cta text-violet-cta font-medium"
        : "border-transparent text-violet-soft hover:text-indigo-deep"
    }`;

  return (
    <div className="min-h-screen bg-lavender">
      <header className="bg-indigo-deep px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-periwinkle text-sm cursor-pointer hover:text-lavender"
          >
            ← Espaces
          </button>
          <span className="text-periwinkle/40">|</span>
          <h1 className="text-lavender font-semibold text-base">
            {space?.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {space && (
            <span className="text-xs text-violet-soft border border-violet-soft/30 px-3 py-1 rounded-full">
              Code : {space.access_code}
            </span>
          )}
          <NotificationBell />
        </div>
      </header>

      {/* Onglets */}
      <div className="bg-white border-b border-periwinkle px-6 flex gap-2">
        <button
          className={tabClass("topics")}
          onClick={() => setActiveTab("topics")}
        >
          Topics
        </button>
        <button
          className={tabClass("planning")}
          onClick={() => setActiveTab("planning")}
        >
          Planning
        </button>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {activeTab === "topics" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-indigo-deep font-semibold text-lg">Topics</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-violet-cta text-white rounded-lg text-sm cursor-pointer"
              >
                Proposer un topic
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-16 text-violet-soft">
                <p className="text-sm">Aucun topic pour l'instant</p>
                <p className="text-xs mt-2">
                  Sois le premier à proposer quelque chose
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    currentUserId={user.id}
                    userVote={userVotes[topic.id] ?? null}
                    onDelete={handleDelete}
                    onVote={handleVote}
                    onRefresh={fetchTopics}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "planning" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-indigo-deep font-semibold text-lg">
                Planning
              </h2>
              <div className="flex gap-2">
                {["all", "proposed", "retained", "done"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={
                      filterStatus === s
                        ? { background: "#7c75d8", color: "#eaedfe" }
                        : {}
                    }
                    className="px-3 py-1 rounded-full text-xs border border-periwinkle text-violet-soft cursor-pointer"
                  >
                    {
                      {
                        all: "Tous",
                        proposed: "Proposé",
                        retained: "Retenu",
                        done: "Terminé",
                      }[s]
                    }
                  </button>
                ))}
              </div>
            </div>

            {plannedTopics.length === 0 ? (
              <div className="text-center py-16 text-violet-soft">
                <p className="text-sm">Aucun topic dans cette catégorie</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {plannedTopics.map((topic, index) => (
                  <div key={topic.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-deep text-lavender text-xs flex items-center justify-center shrink-0 mt-1 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <TopicCard
                        topic={topic}
                        currentUserId={user.id}
                        userVote={userVotes[topic.id] ?? null}
                        onDelete={handleDelete}
                        onVote={handleVote}
                        onRefresh={fetchTopics}
                        readOnly={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showCreate && (
        <CreateTopicModal
          spaceId={spaceId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchTopics}
        />
      )}
    </div>
  );
}
