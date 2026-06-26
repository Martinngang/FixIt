-- Dedicated notifications table, replacing the notification:* keys
-- previously stored in the generic kv_store_accecacf table. A real table
-- with a real recipient_id column is required for Supabase Realtime:
-- Realtime's postgres_changes filters only support eq/neq/gt/lt/in, not the
-- LIKE-prefix matching kv_store's key scheme would have needed.
CREATE TABLE notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  related_issue_id text,
  sender_id uuid,
  sender_name text,
  priority text NOT NULL DEFAULT 'medium',
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_recipient_id_created_at_idx
  ON notifications (recipient_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- The Edge Function writes with the service_role key, which bypasses RLS,
-- so no INSERT policy is needed for regular users - notifications are only
-- ever created server-side. These policies exist so (a) Realtime can
-- evaluate whether a row change is visible to a given subscriber, and
-- (b) a user can manage their own notifications if ever read directly.
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = recipient_id);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
