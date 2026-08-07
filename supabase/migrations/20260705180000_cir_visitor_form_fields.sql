-- Fiche CIR « Nouveaux venus » — champs du formulaire papier

alter table public.field_definitions
  add column if not exists section text not null default 'general';

update public.field_definitions
set is_active = false
where key in ('full_name', 'email', 'phone', 'address', 'notes');

insert into public.field_definitions (
  key, label, field_type, options, required, sort_order, section, is_active
)
values
  ('nom', 'Nom', 'text', null, true, 10, 'identite', true),
  ('prenoms', 'Prénoms', 'text', null, true, 20, 'identite', true),
  ('age', 'Âge', 'text', null, false, 30, 'identite', true),
  ('profession', 'Profession', 'text', null, false, 40, 'identite', true),
  ('contact_tel', 'Contacts (Tél)', 'phone', null, true, 50, 'identite', true),
  (
    'situation_matrimoniale',
    'Situation matrimoniale',
    'select',
    '["Célibataire","Marié(e)","Divorcé(e)","Veuf(ve)"]'::jsonb,
    false,
    60,
    'identite',
    true
  ),
  (
    'adresse',
    'Adresse précise (quartier et autre repère)',
    'textarea',
    null,
    false,
    70,
    'identite',
    true
  ),
  ('eglise_habituelle', 'Église habituelle fréquentée', 'text', null, false, 80, 'identite', true),
  ('invite_par_nom', 'Qui vous a invité — Nom', 'text', null, false, 90, 'identite', true),
  ('invite_par_contact', 'Qui vous a invité — Contact (Tél)', 'phone', null, false, 100, 'identite', true),
  (
    'visite_autorisee',
    'Pouvons-nous vous visiter ?',
    'select',
    '["Oui","Non"]'::jsonb,
    false,
    110,
    'questions',
    true
  ),
  (
    'rencontrer_apotre',
    'Souhaitez-vous personnellement rencontrer l''Apôtre ?',
    'select',
    '["Oui","Non"]'::jsonb,
    false,
    120,
    'questions',
    true
  ),
  (
    'preoccupation_apotre',
    'Si oui, mentionnez en bref l''objet de votre préoccupation',
    'textarea',
    null,
    false,
    130,
    'questions',
    true
  ),
  (
    'culte_apprecie',
    'Avez-vous aimé notre culte d''adoration et de louange ?',
    'select',
    '["Oui","Non"]'::jsonb,
    false,
    140,
    'questions',
    true
  ),
  (
    'participer_cultes',
    'Voudrez-vous bien participer désormais à nos cultes ?',
    'select',
    '["Oui","Non"]'::jsonb,
    false,
    150,
    'questions',
    true
  ),
  (
    'desir_membre_cir',
    'Désirez-vous être membre de notre communauté (CIR) ?',
    'select',
    '["Oui","Non"]'::jsonb,
    false,
    160,
    'questions',
    true
  )
on conflict (key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  options = excluded.options,
  required = excluded.required,
  sort_order = excluded.sort_order,
  section = excluded.section,
  is_active = excluded.is_active;
