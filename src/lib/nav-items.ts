export const dashboardNavItems = [
  { title: "Accueil", href: "/dashboard", shortTitle: "Accueil" },
  { title: "Nouvelle personne", href: "/dashboard/nouveau", shortTitle: "Nouveau" },
  { title: "Personnes", href: "/dashboard/personnes", shortTitle: "Personnes" },
  { title: "Rapports", href: "/dashboard/rapports", shortTitle: "Rapports" },
  { title: "Export", href: "/dashboard/export", shortTitle: "Export" },
] as const;

export const superAdminNavItems = [
  { title: "Administrateurs", href: "/dashboard/admins", shortTitle: "Admins" },
] as const;
