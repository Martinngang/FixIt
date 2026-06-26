-- Records one row per admin "send notification" action, separate from the
-- per-recipient rows in `notifications` (a broadcast to "all" fans out into
-- one notifications row per user, but the admin needs a single auditable
-- entry per send action - title/message/target/how many people got it).
CREATE TABLE notification_broadcasts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  sender_name text,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  priority text NOT NULL DEFAULT 'medium',
  target text NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notification_broadcasts_sender_id_created_at_idx
  ON notification_broadcasts (sender_id, created_at DESC);

ALTER TABLE notification_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Senders can view their own broadcast history"
  ON notification_broadcasts FOR SELECT
  USING (auth.uid() = sender_id);
