import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile dari tabel profiles
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching profile:', err.message)
      return null
    }
  }

  // Fetch customer data
  const fetchCustomer = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Customer mungkin belum ada (belum tentu error)
        return null
      }
      return data
    } catch (err) {
      return null
    }
  }

  // Login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Profile akan di-fetch otomatis oleh onAuthStateChange
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Register
  const register = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Fallback: buat profile secara manual jika trigger gagal
      if (data.user) {
        // Tunggu sebentar agar trigger sempat jalan
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Cek apakah profile sudah ada (dari trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // Jika profile belum ada, buat manual
        if (!existingProfile) {
          console.log('Trigger tidak membuat profile, membuat manual...')
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              role: 'guest',
            })

          if (profileError) {
            console.error('Gagal membuat profile manual:', profileError.message)
          } else {
            console.log('Profile berhasil dibuat manual')
          }
        } else {
          console.log('Profile sudah dibuat oleh trigger')
        }
      }

      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      setCustomer(null)
    } catch (err) {
      console.error('Error logging out:', err.message)
    }
  }

  // Listener auth state change
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setCustomer(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load profile dan customer data
  const loadUserData = async (userId) => {
    setLoading(true)
    try {
      const [profileData, customerData] = await Promise.all([
        fetchProfile(userId),
        fetchCustomer(userId),
      ])
      setProfile(profileData)
      setCustomer(customerData)
    } catch (err) {
      console.error('Error loading user data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    customer,
    loading,
    login,
    register,
    logout,
    isAdmin: profile?.role === 'admin',
    isMember: profile?.role === 'member',
    isGuest: profile?.role === 'guest',
    refreshProfile: () => user && loadUserData(user.id),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}