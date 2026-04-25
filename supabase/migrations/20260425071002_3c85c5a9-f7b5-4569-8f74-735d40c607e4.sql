-- Drop FK to auth.users so mocked accounts work in demo
ALTER TABLE public.ekubs DROP CONSTRAINT IF EXISTS ekubs_created_by_fkey;
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Realtime
ALTER TABLE public.ekubs REPLICA IDENTITY FULL;
ALTER TABLE public.memberships REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.payout_schedules REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ekubs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.payments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_schedules; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Demo public policies (anon role) — additive, do not affect authenticated policies
CREATE POLICY "Demo anon all ekubs" ON public.ekubs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Demo anon all memberships" ON public.memberships FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Demo anon all payments" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Demo anon all payouts" ON public.payout_schedules FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Demo anon read profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Demo anon insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Demo anon update profiles" ON public.profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Seed demo ekubs
INSERT INTO public.ekubs (title, description, plan_type, contribution_amount, cycle_count, target_payout, total_members, current_members, status, created_by, notes_am, notes_en, start_date)
VALUES
  ('መርካቶ ነጋዴዎች እቁብ', 'Weekly Ekub for Mercato traders — trusted circle for restocking capital.', 'weekly', 2000, 12, 24000, 12, 7, 'open', '00000000-0000-0000-0000-000000000001', 'ለነጋዴዎች የተዘጋጀ ሳምንታዊ እቁብ', 'Designed for active Mercato merchants', CURRENT_DATE),
  ('የቦሌ ቤተሰብ እቁብ', 'Monthly family Ekub from Bole community — long horizon, big payout.', 'monthly', 5000, 10, 50000, 10, 4, 'open', '00000000-0000-0000-0000-000000000001', 'ለቤተሰብ ቁጠባ ወርሃዊ እቁብ', 'Family-focused monthly savings', CURRENT_DATE),
  ('ሴቶች ኢኮኖሚ እቁብ', 'Women entrepreneurs Ekub — empowering small business owners.', 'weekly', 1000, 20, 20000, 20, 14, 'open', '00000000-0000-0000-0000-000000000001', 'የሴት ሥራ ፈጣሪዎች እቁብ', 'Women entrepreneurs circle', CURRENT_DATE),
  ('ታክሲ አሽከርካሪዎች እቁብ', 'Daily Ekub for taxi drivers — small daily contributions, fast cycles.', 'daily', 200, 30, 6000, 30, 22, 'open', '00000000-0000-0000-0000-000000000001', 'ለታክሲ አሽከርካሪዎች ዕለታዊ እቁብ', 'Daily circle for taxi drivers', CURRENT_DATE),
  ('የኮድ ዓለም እቁብ', 'Quarterly Ekub for tech professionals — long term wealth building.', 'quarterly', 15000, 4, 60000, 4, 2, 'open', '00000000-0000-0000-0000-000000000001', 'ለቴክ ባለሙያዎች የሚውል እቁብ', 'Tech professionals quarterly circle', CURRENT_DATE);