# Sync — Organisez, votez, planifiez

Application collaborative de planning par votes. Les utilisateurs proposent des topics ou des événements, votent pour leurs préférés, et les résultats génèrent automatiquement un planning trié par popularité.

🔗 **Demo live** : [sync-organize.vercel.app](https://sync-organize.vercel.app)

---

## Fonctionnalités

- **Espaces privés** — créez un espace et invitez vos collaborateurs via un code d'accès unique
- **Topics** — proposez des sujets ou événements avec date et description
- **Votes** — upvote / downvote, un vote par utilisateur par topic, fermeture automatique des votes
- **Planning généré** — vue triée par score de votes avec filtres par statut
- **Commentaires** — échangez sur chaque topic
- **Notifications in-app** — alertes de votes et rappels d'événements approchants
- **Temps réel** — les scores se mettent à jour instantanément via Supabase Realtime
- **Authentification** — inscription, connexion, gestion du profil

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Déploiement | Vercel |

---

## Architecture BDD

profiles          — utilisateurs (lié à Supabase Auth)
spaces            — espaces de travail
space_members     — relation membres ↔ espaces
topics            — sujets proposés dans un espace
votes             — votes par utilisateur par topic
comments          — commentaires sur les topics
notifications     — notifications in-app

---

## Lancer le projet en local

```bash
# Cloner le repo
git clone https://github.com/AndoJo001/sync-app.git
cd sync-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplis VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY

# Lancer le serveur de développement
npm run dev
```

---

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

---

## Auteur

**Ando** — Developpeur Web 
[Portfolio](https://andorajohna.vercel.app) · [GitHub](https://github.com/AndoJo001) · [LinkedIn](https://www.linkedin.com/in/ando-rajohna)