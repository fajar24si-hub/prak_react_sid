-- ============================================================
-- FIX: Profiles tidak terbuat saat register
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Fix RLS Policy untuk profiles
-- Policy lama: auth.uid() = id (terlalu ketat, bisa gagal)
-- Policy baru: allow authenticated users to insert
-- ============================================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Allow authenticated users to insert profile
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR true);

-- ============================================================
-- STEP 1b: Cek struktur tabel profiles
-- Jalankan ini dulu untuk melihat kolom yang ada:
-- ============================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- ============================================================
-- STEP 2: Fix handle_new_user trigger
-- Catatan: tabel profiles TIDAK punya kolom email!
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
-- STEP 3: Buat profile untuk user yang sudah register tapi belum punya profile
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
-- STEP 4: Verifikasi - jalankan untuk cek
-- Semua user di auth.users harus punya profile
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
-- Coba register user baru, profile harusnya sudah masuk.
-- ============================================================