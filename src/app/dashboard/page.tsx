'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
  const { user } = useAuth()
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {user?.full_name}! 👋
            </h1>
            <p className="text-xl text-orange-100 mb-4">
              Your dashboard is working! Authentication successful.
            </p>
            <div className="text-sm text-orange-200">
              🎉 Phase 3 Complete: Dashboard integration with authentication
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 
