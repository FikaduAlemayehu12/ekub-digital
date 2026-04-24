CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.ekub_plan_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');
CREATE TYPE public.ekub_status AS ENUM ('draft', 'open', 'full', 'active', 'completed', 'cancelled');
CREATE TYPE public.membership_status AS ENUM ('pending', 'active', 'replaced', 'cancelled', 'completed');
CREATE TYPE public.member_kind AS ENUM ('user', 'maedot');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'late', 'waived');
CREATE TYPE public.payout_status AS ENUM ('scheduled', 'ready', 'paid', 'skipped');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
  phone_number TEXT NOT NULL UNIQUE CHECK (char_length(trim(phone_number)) BETWEEN 9 AND 20),
  email TEXT,
  address TEXT NOT NULL CHECK (char_length(trim(address)) BETWEEN 3 AND 255),
  preferred_language TEXT NOT NULL DEFAULT 'am' CHECK (preferred_language IN ('am', 'en')),
  risk_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  grace_days INTEGER NOT NULL DEFAULT 3 CHECK (grace_days >= 0 AND grace_days <= 30),
  penalty_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (penalty_balance >= 0),
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE TABLE public.ekubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
  description TEXT,
  plan_type public.ekub_plan_type NOT NULL,
  contribution_amount NUMERIC(12,2) NOT NULL CHECK (contribution_amount > 0),
  target_payout NUMERIC(12,2) NOT NULL CHECK (target_payout > 0),
  cycle_count INTEGER NOT NULL CHECK (cycle_count > 1),
  total_members INTEGER NOT NULL CHECK (total_members > 1),
  current_members INTEGER NOT NULL DEFAULT 1 CHECK (current_members >= 0),
  start_date DATE,
  end_date DATE,
  grace_period_days INTEGER NOT NULL DEFAULT 3 CHECK (grace_period_days >= 0 AND grace_period_days <= 30),
  late_penalty_percent NUMERIC(5,2) NOT NULL DEFAULT 2 CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),
  maedot_limit_percent NUMERIC(5,2) NOT NULL DEFAULT 30 CHECK (maedot_limit_percent >= 0 AND maedot_limit_percent <= 30),
  status public.ekub_status NOT NULL DEFAULT 'draft',
  notes_en TEXT,
  notes_am TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ekub_target_matches_cycles CHECK (target_payout = contribution_amount * cycle_count),
  CONSTRAINT ekub_members_match_cycles CHECK (total_members = cycle_count),
  CONSTRAINT ekub_current_members_not_over_capacity CHECK (current_members <= total_members),
  CONSTRAINT ekub_date_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ekub_id UUID NOT NULL REFERENCES public.ekubs(id) ON DELETE CASCADE,
  payout_order INTEGER CHECK (payout_order IS NULL OR payout_order > 0),
  payout_date DATE,
  member_kind public.member_kind NOT NULL DEFAULT 'user',
  status public.membership_status NOT NULL DEFAULT 'pending',
  is_replacement BOOLEAN NOT NULL DEFAULT false,
  replaced_membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  payout_locked BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT membership_identity_required CHECK (
    (member_kind = 'user' AND user_id IS NOT NULL) OR
    (member_kind = 'maedot' AND user_id IS NULL)
  )
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ekub_id UUID NOT NULL REFERENCES public.ekubs(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  status public.payment_status NOT NULL DEFAULT 'pending',
  penalty_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (penalty_amount >= 0),
  transaction_ref TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ekub_id UUID NOT NULL REFERENCES public.ekubs(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  payout_order INTEGER NOT NULL CHECK (payout_order > 0),
  scheduled_date DATE,
  actual_payout_date TIMESTAMPTZ,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status public.payout_status NOT NULL DEFAULT 'scheduled',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (membership_id),
  UNIQUE (ekub_id, payout_order)
);

CREATE INDEX idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX idx_profiles_language ON public.profiles(preferred_language);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_ekubs_status_plan_type ON public.ekubs(status, plan_type);
CREATE INDEX idx_ekubs_created_by ON public.ekubs(created_by);
CREATE INDEX idx_memberships_ekub_id ON public.memberships(ekub_id);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_payments_user_due ON public.payments(user_id, due_date);
CREATE INDEX idx_payments_ekub_status ON public.payments(ekub_id, status);
CREATE INDEX idx_payout_schedules_ekub_order ON public.payout_schedules(ekub_id, payout_order);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can browse active ekubs"
ON public.ekubs
FOR SELECT
TO authenticated
USING (status IN ('open', 'full', 'active', 'completed') OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create ekubs"
ON public.ekubs
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators and admins can update ekubs"
ON public.ekubs
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators and admins can delete draft ekubs"
ON public.ekubs
FOR DELETE
TO authenticated
USING ((created_by = auth.uid() AND status = 'draft') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own or related memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can join ekubs"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (
  (
    member_kind = 'user'
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.ekubs e
      WHERE e.id = ekub_id
        AND e.status IN ('open', 'draft')
        AND e.current_members < e.total_members
    )
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users and admins can update related memberships"
ON public.memberships
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins and creators can delete memberships"
ON public.memberships
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can view own payments and admins can oversee"
ON public.payments
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can create own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users and admins can update own payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payments"
ON public.payments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view only their payout slot and admins can oversee"
ON public.payout_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.memberships m
    JOIN public.ekubs e ON e.id = m.ekub_id
    WHERE m.id = membership_id
      AND (
        m.user_id = auth.uid()
        OR e.created_by = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
  )
);

CREATE POLICY "Creators and admins can create payout schedules"
ON public.payout_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Creators and admins can update payout schedules"
ON public.payout_schedules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ekubs e
    WHERE e.id = ekub_id
      AND (e.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins can delete payout schedules"
ON public.payout_schedules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number, email, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Member'),
    COALESCE(NEW.phone, 'pending-phone'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'address', 'Addis Ababa')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ekubs_updated_at
BEFORE UPDATE ON public.ekubs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_schedules_updated_at
BEFORE UPDATE ON public.payout_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();