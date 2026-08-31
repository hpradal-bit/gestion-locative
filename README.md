# Gestion locative

Application SaaS de gestion locative immobilière — Next.js (App Router, TypeScript),
Tailwind CSS + shadcn/ui, Supabase (PostgreSQL, Auth, Storage).

## Statut

**Phase 1 — Fondations** : architecture, design system, navigation (sidebar desktop /
bottom nav mobile), mode sombre, authentification Supabase (email/mot de passe),
pages squelettes pour chaque section. Aucune logique métier n'est encore développée
(biens, locataires, loyers...) — voir la roadmap ci-dessous.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev
```

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **TypeScript strict**
- **Tailwind CSS v4** + **shadcn/ui** (style New York) pour le design system
- **Supabase** — PostgreSQL, Auth, Storage, RLS pour l'isolation des données entre
  utilisateurs
- **Zod** pour la validation, côté client et serveur

## Architecture des dossiers

```
src/
  app/            # routes (App Router)
    (auth)/       # login, inscription — pages publiques
    (app)/        # dashboard, biens, locataires, ... — protégées par proxy.ts
  components/
    ui/           # primitives shadcn/ui
    layout/       # sidebar, header, navigation mobile
    shared/       # composants réutilisables (EmptyState, PageHeader, ...)
  features/       # logique métier par domaine (auth, properties, tenants, ...)
  lib/            # utilitaires, clients Supabase, calculs financiers (lib/finance)
  proxy.ts        # rafraîchissement de session + protection des routes
```

## Roadmap

1. ~~Fondations~~ (en cours)
2. Dashboard (KPIs, graphiques, alertes)
3. Biens
4. Locataires & baux
5. Loyers (échéances, paiements, statuts)
6. Quittances (PDF)
7. Dépenses
8. Travaux
9. Financements (crédits, amortissement)
10. Rentabilité
11. Simulateur
12. Notifications
13. Documents
14. Optimisation (mobile, performance, accessibilité)
15. Qualité (tests, sécurité, nettoyage)

Chaque phase est développée et validée avant de passer à la suivante.
