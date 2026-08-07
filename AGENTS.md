<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CIR Welcom — Contexte projet pour IA

Tu travailles sur **CIR Welcom**, une application web interne pour le **CIR (Palais de Dieu, Cotonou)**. Elle sert à enregistrer et suivre les **nouvelles personnes** accueillies lors des cultes, avec un suivi pastoral et des statistiques pour l'équipe admin.

**Langue UI :** français exclusivement (libellés, messages d'erreur, dates formatées en locale `fr-FR`).

**Licence :** projet privé, usage interne uniquement.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 16** (App Router, TypeScript) — consulter `node_modules/next/dist/docs/` avant d'écrire du code |
| React | 19 |
| Base de données + Auth | **Appwrite** (Databases + Auth) |
| SDK | `appwrite` (client) + `node-appwrite` (serveur / scripts) |
| Session | Cookies httpOnly gérés côté serveur (session Appwrite) |
| UI | Tailwind CSS **v4**, shadcn/ui, **@base-ui/react** |
| Icônes | lucide-react |
| PDF | Impression navigateur (`window.print()`) — **pas** de lib PDF serveur |
| Déploiement | Vercel (recommandé) |

Variables d'environnement :

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...                    # serveur et scripts CLI uniquement
APPWRITE_DATABASE_ID=...
APPWRITE_ADMINS_COLLECTION_ID=...
APPWRITE_VISITORS_COLLECTION_ID=...
APPWRITE_FIELD_DEFINITIONS_COLLECTION_ID=...
```

La clé API (`APPWRITE_API_KEY`) ne doit **jamais** être exposée côté client.

---

## Architecture

```
Navigateur (React)
       ↓
Next.js Server Components + Server Actions (`"use server"`)
       ↓
Appwrite Auth (session) + Appwrite Databases (permissions)
```

- **Server Components** par défaut pour les pages dashboard (fetch direct Appwrite).
- **Client Components** (`"use client"`) uniquement pour : formulaires interactifs, modales, recherche ⌘K, pagination, calendrier.
- **Server Actions** dans `src/lib/visitors/actions.ts` et `src/lib/auth/` pour les mutations.
- Session protégée via `requireActiveAdmin()` (`src/lib/auth/session.ts`).
- Middleware équivalent : `src/proxy.ts` (refresh / validation session Appwrite).

**Sécurité :** accès restreint aux admins actifs via permissions Appwrite (collections + documents) et vérification serveur (`admins.is_active = true`). Ne jamais faire confiance au seul contrôle côté client.

---

## Modèle de données (Appwrite Databases)

Base : `APPWRITE_DATABASE_ID`

### Collection `admins`
Profil admin lié au compte Appwrite Auth (`userId`).

| Attribut | Type | Description |
|----------|------|-------------|
| `userId` | string | ID utilisateur Appwrite Auth |
| `name` | string | Nom affiché |
| `isActive` | boolean | Compte actif |
| `role` | enum | `admin` ou `super_admin` |

### Collection `field_definitions`
Champs dynamiques du formulaire CIR (sectionnés).

Types supportés : `text`, `email`, `phone`, `date`, `textarea`, `select`, `checkbox`.

### Collection `visitors`
Fiches des nouveaux venus.

| Attribut | Type | Description |
|----------|------|-------------|
| `culteDate` | datetime/string | Date du culte (première visite) — **base des statistiques** |
| `culteType` | enum | `dim` (dimanche) ou `mer` (mercredi) |
| `data` | object (JSON) | Réponses du formulaire dynamique |
| `visitedAt` | datetime \| null | Visite pastorale programmée |
| `calledAt` | datetime \| null | Appel programmé |
| `returnedAt` | datetime \| null | Date retour au culte (`null` = non revenue) |
| `registeredBy` | string | ID admin créateur |
| `updatedBy` | string | ID admin dernier modificateur |
| `$createdAt` | datetime | Date d'enregistrement de la fiche (Appwrite) |

**Distinction importante :**

- Stats / rapports / calendrier → filtrer sur **`culteDate`**
- « Fiches saisies ce mois » → filtrer sur **`$createdAt`**

**Requêtes :** utiliser les queries Appwrite (`Query.equal`, `Query.greaterThanEqual`, `Query.lessThanEqual`, `Query.orderDesc`, `Query.limit`, `Query.offset`, etc.).

---

## Routes principales

```
/                              → redirect login ou dashboard
/login, /login/signup, /login/forgot-password, /login/set-password, /login/reset-password
/auth/callback                 → callback session Appwrite (si utilisé)
/auth/signout                  → déconnexion

/dashboard                                    → KPIs mois courant + calendrier cultes
/dashboard?month=YYYY-MM                      → stats d'un mois passé
/dashboard/nouveau                            → nouvelle fiche
/dashboard/personnes                          → liste paginée (9/page), ?q= recherche
/dashboard/personnes/[id]                     → fiche détail + suivi pastoral inline
/dashboard/personnes/[id]/modifier            → édition
/dashboard/personnes/[id]/print               → PDF fiche
/dashboard/stats/[yearMonth]                  → drill-down mois
/dashboard/stats/[yearMonth]/[date]           → personnes d'un culte
/dashboard/stats/.../print                    → PDF stats
/dashboard/rapports                           → semaine / mois / 3m / 6m / année
/dashboard/rapports/print?period=week|month|3m|6m|year
/dashboard/export?from=&to=                   → export plage personnalisée
/dashboard/export/print?from=&to=
/dashboard/admins                             → gestion admins (super_admin)
```

---

## Structure du code

```
src/
├── app/                    → pages App Router (dashboard/, login/, auth/)
├── components/
│   ├── layout/             → topnav, shell, header, recherche ⌘K
│   ├── visitors/           → formulaires, fiche détail, suivi pastoral, pagination
│   ├── stats/              → cartes KPI, vues print
│   ├── calendar/           → calendrier cultes
│   ├── reports/            → rapports période
│   ├── export/             → export plage dates
│   ├── auth/               → login, signup, admins
│   └── ui/                 → composants shadcn (button, card, input, …)
├── lib/
│   ├── auth/               → session, actions auth, admin-actions
│   ├── appwrite/           → client, server, admin, config
│   ├── visitors/           → queries, actions, stats, format, form-utils
│   ├── culte-utils.ts      → dates cultes, dim/mer
│   ├── culte-data.ts       → types culte
│   ├── database.types.ts   → types collections / documents
│   └── utils.ts            → cn()
└── proxy.ts
scripts/                    → invite-admin, reset-admin, setup-appwrite
```

**Conventions de nommage :**

- Fichiers : kebab-case (`visitor-detail-view.tsx`)
- Composants : PascalCase
- Queries/stats : `src/lib/visitors/*.ts` (pas dans les composants)
- Server Actions : `"use server"` en tête de fichier, retour `{ error?, success? }`
- Attributs Appwrite en **camelCase** dans le code TypeScript

---

## Design UI

**Référence visuelle :** dashboard SaaS épuré (inspiré Real Estate SaaS — Behance Gravix).

- **Topnav horizontale** (pas de sidebar)
- Typographie Inter, palette claire, accent bleu `#0057d8`
- Tokens CSS `--livento-*` dans `globals.css`
- Classes utilitaires dashboard : `dash-btn-primary`, `dash-btn-secondary`, `dash-card`, etc.
- Cartes arrondies (`rounded-2xl`), ombres légères, badges Oui/Non (vert/rouge)
- Suivi pastoral : 3 boxes inline (Visite / Appel / Revenue) avec boutons compacts « Programmer » / « Modifier » et date affichée si programmé

**Composants existants à réutiliser :**

- `DashboardShell`, `DashboardPage`, `AppTopnav`
- `StatCard`, `StatCardLink` (KPIs cliquables)
- `FollowUpDetailPanel` (suivi pastoral sur fiche détail)
- `ScheduleVisitDialog`, `ScheduleCallDialog`, `MarkReturnedDialog` (variants `default` | `inline`)
- `VisitorSearchDialog` (⌘K / Ctrl+K)

---

## Règles de développement

1. **Minimal scope** — diff ciblé, pas de refacto non demandé.
2. **Réutiliser** queries/actions/composants existants avant d'en créer de nouveaux.
3. **Server-first** — fetch en Server Component ; client seulement si interactivité requise.
4. **Pas de lib PDF** — nouvelles pages print = composant dédié + `@media print` + `window.print()`.
5. **Schéma Appwrite** — tout changement de collection via scripts de setup versionnés (`scripts/setup-appwrite.ts` ou équivalent), pas de modifications manuelles non documentées.
6. **Types** — aligner sur `database.types.ts` et les interfaces `Visitor`, `FieldDefinition`, `Admin`, etc.
7. **Revalidation** — après mutation visiteur, appeler `revalidatePath` sur dashboard, personnes, fiche concernée.
8. **Formatage dates** — `formatDateFr`, `formatDateTimeFr` dans `lib/visitors/format-field-value.ts`.
9. **Commits** — ne commit que si l'utilisateur le demande explicitement.
10. **UI en français** — tous les textes visibles par l'utilisateur.
11. **Appwrite côté serveur** — mutations sensibles et lectures admin via `node-appwrite` + session utilisateur ou clé API serveur ; jamais la clé API dans le bundle client.

---

## Fonctionnalités livrées (MVP)

- Auth admin (login, signup, reset password, invitation)
- CRUD fiches visiteurs (formulaire dynamique CIR)
- Suivi pastoral : visite, appel, retour au culte
- Dashboard stats réelles + navigation par mois
- Drill-down : mois → culte (jour) → liste personnes
- Rapports période + export plage dates + PDF print
- Recherche globale + pagination liste Personnes (9/page)
- Gestion admins (super_admin)
- KPIs dashboard cliquables (filtres sur `/dashboard/personnes`)

## Backlog (non prioritaire)

- Notifications réelles (cloche topnav actuellement décorative)
- Rappels / emails récap automatiques

---

## Exemple de tâche typique

> « Ajouter un filtre par type de culte sur la page Personnes »

Attendu :

1. Étendre `personnes-filters.ts` et `queries.ts` (query param `?culte=dim|mer`, query Appwrite `Query.equal("culteType", …)`)
2. UI filtre dans `app/dashboard/personnes/page.tsx`
3. Conserver pagination et recherche existantes
4. Pas de nouvelle dépendance
5. UI en français, style dashboard existant

---

## Ce qu'il ne faut PAS faire

- Introduire une sidebar (le layout est topnav)
- Utiliser jQuery, Redux, ou une lib PDF serveur
- Hardcoder les champs du formulaire (ils viennent de `field_definitions`)
- Filtrer les stats sur `$createdAt` quand la demande concerne les cultes (`culteDate`)
- Exposer `APPWRITE_API_KEY` côté client
- Supposer Next.js 14/15 — vérifier la doc Next.js 16 du projet
- Écrire de la doc README sauf demande explicite
- Mélanger Supabase et Appwrite — la stack cible est **Appwrite uniquement**
