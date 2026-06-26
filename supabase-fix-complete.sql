-- ============================================================
-- COMPLETE FIX: Supabase RLS + Trigger + Profile
-- Sesuai dengan schema database yang sebenarnya
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS PADA SEMUA TABEL
-- ============================================================
ALTER TABLE IF EXISTS public.note ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RLS POLICIES: PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Profiles: public read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user update" ON public.profiles;

CREATE POLICY "Profiles: public read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Profiles: user insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Profiles: user update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 3. RLS POLICIES: CUSTOMERS
-- ============================================================
DROP POLICY IF EXISTS "Customers: public read" ON public.customers;
DROP POLICY IF EXISTS "Customers: auth insert" ON public.customers;
DROP POLICY IF EXISTS "Customers: auth update" ON public.customers;

CREATE POLICY "Customers: public read" ON public.customers
  FOR SELECT USING (true);

CREATE POLICY "Customers: auth insert" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers: auth update" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. RLS POLICIES: PRODUCTS
-- ============================================================
DROP POLICY IF EXISTS "Products: public read" ON public.products;
DROP POLICY IF EXISTS "Products: auth all" ON public.products;

CREATE POLICY "Products: public read" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Products: auth all" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. RLS POLICIES: ORDERS
-- ============================================================
DROP POLICY IF EXISTS "Orders: auth read" ON public.orders;
DROP POLICY IF EXISTS "Orders: auth insert" ON public.orders;
DROP POLICY IF EXISTS "Orders: auth update" ON public.orders;

CREATE POLICY "Orders: auth read" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Orders: auth insert" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Orders: auth update" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. RLS POLICIES: ORDER ITEMS
-- ============================================================
DROP POLICY IF EXISTS "OrderItems: auth all" ON public.order_items;

CREATE POLICY "OrderItems: auth all" ON public.order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. RLS POLICIES: POINT TRANSACTIONS
-- ============================================================
DROP POLICY IF EXISTS "PointTx: auth all" ON public.point_transactions;

CREATE POLICY "PointTx: auth all" ON public.point_transactions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 8. RLS POLICIES: TIERS
-- ============================================================
DROP POLICY IF EXISTS "Tiers: public read" ON public.tiers;

CREATE POLICY "Tiers: public read" ON public.tiers
  FOR SELECT USING (true);

-- ============================================================
-- 9. RLS POLICIES: TRANSACTIONS
-- ============================================================
DROP POLICY IF EXISTS "Transactions: auth all" ON public.transactions;

CREATE POLICY "Transactions: auth all" ON public.transactions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 10. RLS POLICIES: NOTE
-- ============================================================
DROP POLICY IF EXISTS "Note: public read" ON public.note;
DROP POLICY IF EXISTS "Note: auth all" ON public.note;

CREATE POLICY "Note: public read" ON public.note
  FOR SELECT USING (true);

CREATE POLICY "Note: auth all" ON public.note
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. FIX: handle_new_user TRIGGER
-- Catatan: profiles.tidak punya kolom email
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'guest')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE WARNING 'Profile already exists for user %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 12. FIX: Search Path untuk semua SECURITY DEFINER functions
-- ============================================================
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public',
        func.proname,
        func.args
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ============================================================
-- 13. Buat profile untuk user yang sudah register tapi belum punya profile
-- ============================================================
INSERT INTO public.profiles (id, full_name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'guest')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 14. Grant permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================
-- 15. VERIFIKASI - Cek semua user punya profile
-- ============================================================
SELECT 
  au.id,
  au.email,
  p.id as profile_id,
  p.full_name,
  p.role,
  CASE WHEN p.id IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- ============================================================
-- DONE!
-- ============================================================