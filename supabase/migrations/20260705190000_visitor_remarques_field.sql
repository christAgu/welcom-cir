-- Champ remarques en fin de fiche nouveau venu

insert into public.field_definitions (
  key, label, field_type, options, required, sort_order, section, is_active
)
values (
  'remarques',
  'Remarques',
  'textarea',
  null,
  false,
  170,
  'remarques',
  true
)
on conflict (key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  sort_order = excluded.sort_order,
  section = excluded.section,
  is_active = excluded.is_active;
