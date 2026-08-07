CREATE POLICY "Anyone can view public membership plans" ON "membership_plans" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
    status = 'Active'
    and deleted_at is null
    and visibility = 'Visible to Everyone'
  );