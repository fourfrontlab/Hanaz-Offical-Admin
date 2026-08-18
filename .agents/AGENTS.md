# Standing Instructions

## Run Supabase SQL Yourself

Going forward, whenever a task in this project requires running SQL against Supabase — creating tables, adding columns, writing functions/triggers, applying RLS policies, running test inserts, or querying data to diagnose a bug — **execute it yourself directly**, using whatever Supabase connection you have configured (Supabase CLI, MCP database tool, or direct connection string), rather than printing the SQL and asking me to paste it into the Supabase SQL Editor myself.

### Rules

1. **Always attempt direct execution first.** If you have `supabase db execute`, an MCP Supabase/Postgres tool, or any other configured access, use it.
2. **Verify after running.** After any schema change (new column, function, trigger, policy), confirm it actually took effect — check the table structure, function list, or trigger list, don't just assume success from the command exiting cleanly.
3. **Use migration files properly.** If the project already uses `supabase/migrations/`, write new changes as a new numbered migration file AND apply it (via `supabase db push` or direct execution) — don't leave a migration file sitting unapplied. If you write a migration file, immediately confirm in the same task whether it was actually pushed to the live database.
4. **Only ask me to run something manually if you genuinely cannot** — for example, a permissions error, missing credentials, or a CLI/tool failure you can't resolve yourself. In that case, tell me exactly what failed and why, and only then give me the SQL to run manually as a fallback.
5. **Test data cleanup.** If you insert test rows to verify something works (test orders, test order_items, etc.), clean them up yourself afterward unless I say otherwise — don't leave test/junk data in the live database.
6. **Report what you actually did**, not just what you intended — e.g. "Ran migration X via `supabase db push`, confirmed `stock_quantity` column now exists in `products`" rather than just "Added the stock_quantity column."
