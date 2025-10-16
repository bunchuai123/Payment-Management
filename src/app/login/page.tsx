'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ username: email, password })
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black dark:bg-black py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-40"></div>
        <Card className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-orange-100 text-lg">
              Sign in to your payment management account
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@example.com (for testing)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-12 pl-4"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-12 pl-4"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </div>
            </Button>
          </form>

          <div className="mt-4">
            <Button 
              type="button"
              onClick={() => {
                setEmail('manager@example.com')
                setPassword('manager123')
              }}
              variant="ghost"
              className="w-full mt-2 text-xs text-orange-200 hover:text-white hover:bg-orange-500/20"
            >
              Auto-fill Manager Credentials
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-orange-100">
              Don't have an account?{' '}
              <Link href="/register" className="text-white font-semibold hover:text-orange-200 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
