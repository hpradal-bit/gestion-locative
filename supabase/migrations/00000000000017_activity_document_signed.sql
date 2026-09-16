-- Autorise le nouvel événement 'document_signed' du journal d'activité
-- (signature électronique).

alter table public.activity_events drop constraint if exists activity_events_action_check;

alter table public.activity_events add constraint activity_events_action_check
  check (action in (
    'reminder_sent',
    'receipt_generated',
    'payment_recorded',
    'lease_created',
    'lease_updated',
    'lease_ended',
    'document_added',
    'document_deleted',
    'document_signed',
    'property_created',
    'property_updated',
    'simulation_created',
    'simulation_updated'
  ));
