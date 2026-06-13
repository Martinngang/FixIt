-- Key-value store backing all FixIt application data
-- (issues, notifications, profiles, user-issue mappings)
CREATE TABLE kv_store_accecacf (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Only the Deno server (using the service_role key) accesses this table,
-- so block all access from the anon/authenticated roles.
ALTER TABLE kv_store_accecacf ENABLE ROW LEVEL SECURITY;
