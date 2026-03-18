# Plan : Fonctionnalités indispensables pour usage TPE

## Contexte

L'application doit servir à une TPE (~7 personnes) pour :
- Visualiser les projets en cours
- Savoir **qui passe combien de temps sur quel projet**
- Faire des estimations fiables et rationaliser le temps de chaque employé
- Donner au manager une vue consolidée par employé

**Problème actuel :** `actualTime` est un champ unique sur la tâche (non lié à un utilisateur). Plusieurs personnes peuvent être assignées à une tâche mais une seule valeur de temps existe → impossible de savoir qui a passé quoi.

---

## Ce qui manque (priorisé)

### 🔴 Indispensable

#### 1. Table `timeEntries` — saisie de temps par personne
Nouveau modèle central : chaque employé loggue son propre temps sur les tâches.

```
timeEntries: id, orgId, userId, taskId, projectId, duration, unit, date, note (optional)
```

- Remplace partiellement `actualTime` sur la tâche (qui devient un agrégat calculé)
- Permet plusieurs entrées par personne par tâche (sessions de travail)
- Agrégeable par personne / projet / période

#### 2. UI « Saisir mon temps » sur les tâches
- Bouton "Saisir mon temps" sur `TaskItem` et `TaskDetailModal` (toujours visible, pas seulement à la complétion)
- Formulaire simple : durée + unité + date (aujourd'hui par défaut) + note optionnelle
- Liste des entrées de la tâche : qui a loggué quoi
- `ActualTimeModal` actuel conservé pour le passage en "done" (pré-remplit la saisie)

#### 3. Page Rapports `/reports` — vue manager
Page dédiée accessible à tous, filtrée selon le rôle.

**Vue "Par employé" (admin) :**
- Sélecteur de période (cette semaine / ce mois / 30 derniers jours / personnalisé)
- Une ligne par employé avec expand : temps total + détail par projet
- Comparaison temps estimé vs réel par projet/personne

**Vue "Par projet" (admin) :**
- Une ligne par projet avec expand : détail par employé
- Barres proportionnelles simples (CSS, pas de lib externe)

**Vue "Ma semaine" (membre) :**
- Chaque employé voit uniquement ses propres entrées
- Tableau jour par jour cette semaine, quel projet/tâche

#### 4. Widget "Mon temps" sur le dashboard
- Section en bas : temps loggué cette semaine par l'utilisateur connecté
- Top projets sur lesquels il a travaillé
- Visible pour tous

---

### 🟡 Important (phase suivante, pas dans ce plan)

- Export CSV des rapports
- Vue capacité / charge de l'équipe (heures estimées restantes par personne)

---

## Fichiers à créer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/db/schema.ts` | Modifier | Ajouter table `timeEntries` |
| `src/db/index.ts` | Modifier | Migration `CREATE TABLE IF NOT EXISTS time_entries` |
| `src/types/index.ts` | Modifier | Ajouter interface `TimeEntry` |
| `src/app/api/time-entries/route.ts` | Créer | GET (filtré org/user/project/période) + POST |
| `src/app/api/time-entries/[id]/route.ts` | Créer | DELETE (owner ou admin seulement) |
| `src/components/tasks/TimeEntryForm.tsx` | Créer | Formulaire saisie (durée + unité + date + note) |
| `src/components/tasks/TimeEntryList.tsx` | Créer | Liste des entrées sur une tâche |
| `src/components/tasks/TaskDetailModal.tsx` | Modifier | Ajouter onglet/section "Temps loggué" |
| `src/components/projects/TaskItem.tsx` | Modifier | Ajouter bouton "⏱ Saisir" |
| `src/app/reports/page.tsx` | Créer | Page rapports (admin : par employé + par projet ; membre : ma semaine) |
| `src/components/layout/Sidebar.tsx` | Modifier | Ajouter lien "Rapports" dans la nav |
| `src/app/page.tsx` | Modifier | Ajouter widget "Mon temps cette semaine" |
| `src/context/AppContext.tsx` | Modifier | Charger timeEntries, exposer helpers |

---

## Schéma DB — nouvelle table

```sql
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  duration INTEGER NOT NULL,
  unit TEXT NOT NULL,        -- 'minutes' | 'hours' | 'days'
  date TEXT NOT NULL,        -- YYYY-MM-DD
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Migration via `CREATE TABLE IF NOT EXISTS` dans `src/db/index.ts` (pattern existant).

---

## API

**GET /api/time-entries** — params: `projectId?`, `userId?`, `taskId?`, `from?`, `to?`
- Filtrée sur l'organisation du cookie session
- Si membre (non-admin) : retourne seulement les entrées de l'utilisateur connecté

**POST /api/time-entries** — body: `{ taskId, projectId, duration, unit, date, note? }`
- `userId` = utilisateur courant (extrait du cookie session)

**DELETE /api/time-entries/[id]**
- Autorisé si `userId === entry.userId` OU rôle admin

---

## Page Rapports — layout

```
/reports
├── Titre "Rapports"
├── Sélecteur période  [Cette semaine | Ce mois | Personnalisé]
├── (Admin) Toggle  [Par employé ▼ | Par projet]
│
│  Vue "Par employé" :
│  ┌──────────────────────────────────────────────┐
│  │ 👤 Alice Martin           Total : 14h 30m     │
│  │   ├── Projet Alpha        8h 00m  ████████░░  │
│  │   ├── Projet Beta         4h 30m  █████░░░░░  │
│  │   └── Projet Gamma        2h 00m  ██░░░░░░░░  │
│  └──────────────────────────────────────────────┘
│
│  Vue "Par projet" :
│  ┌──────────────────────────────────────────────┐
│  │ 📁 Projet Alpha           Total : 22h 00m     │
│  │   ├── Alice Martin        8h 00m  ████░░░░░░  │
│  │   ├── Bob Dupont         10h 00m  █████░░░░░  │
│  │   └── Claire Leroy        4h 00m  ██░░░░░░░░  │
│  └──────────────────────────────────────────────┘
│
│  Vue "Ma semaine" (membre) :
│  Tableau Lun–Dim avec entrées par jour (projet + tâche + durée)
```

---

## Vérification end-to-end

1. Alice loggue 2h sur "Maquettes" (Projet Alpha) → entrée créée avec `userId=Alice`
2. Bob loggue 3h sur la même tâche → entrée séparée, indépendante
3. Page Rapports → Vue par employé → Alice : 2h sur Projet Alpha, Bob : 3h
4. Vue par projet → Projet Alpha : Alice 2h + Bob 3h = 5h total
5. Alice (membre) ne voit que "Ma semaine", pas les données des autres
6. Admin voit toutes les vues et tous les employés
7. Widget dashboard : Alice voit son total de la semaine
8. Supprimer une entrée : OK si propriétaire ou admin
