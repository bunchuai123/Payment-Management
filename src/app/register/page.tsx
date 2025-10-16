'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Mail, Lock, User, Building, Shield, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: '',
    role: 'employee' as const
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        department: formData.department || undefined,
        role: formData.role
      })
      setSuccess('Registration successful! Please login to continue.')
      setTimeout(() => router.push('/login'), 2000)
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-40"></div>
        <Card className="relative w-full max-w-lg bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Join Our Team
            </CardTitle>
            <CardDescription className="text-orange-100 text-lg">
              Create your payment management account
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label htmlFor="full_name" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-11"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="department" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department (Optional)
              </label>
              <Input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Engineering, HR, Finance"
                value={formData.department}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-11"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="role" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white h-11 w-full rounded-md px-3 py-2 text-sm focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none"
              >
                <option value="employee" className="bg-gray-800 text-white">Employee</option>
                <option value="manager" className="bg-gray-800 text-white">Manager</option>
                <option value="hr" className="bg-gray-800 text-white">HR</option>
                <option value="admin" className="bg-gray-800 text-white">Admin</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
              </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-11"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-orange-100 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-orange-200 focus:border-orange-400 focus:ring-orange-400/20 h-11"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm text-center p-3 rounded-lg">
                {success}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </div>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-orange-100">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-orange-200 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
