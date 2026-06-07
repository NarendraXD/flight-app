'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0f1e] flex items-center justify-center px-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-20 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-blue-300 text-sm mt-1">Start booking flights today</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </div>

          <p className="text-sm text-blue-400 text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}