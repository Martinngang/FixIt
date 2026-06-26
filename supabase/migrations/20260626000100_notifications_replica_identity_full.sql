-- Realtime's UPDATE/DELETE payloads only include the primary key in `old`
-- by default. The frontend badge-count logic needs payload.old.read to
-- correctly increment/decrement on read-state changes and deletes, so the
-- table needs to replicate full row data, not just the key.
ALTER TABLE notifications REPLICA IDENTITY FULL;
