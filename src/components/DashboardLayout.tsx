'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  DollarSign,
  CheckSquare,
  BarChart
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['employee', 'manager', 'hr', 'admin'] },
    { name: 'My Requests', href: '/requests', icon: FileText, roles: ['employee', 'manager', 'hr', 'admin'] },
    { name: 'New Request', href: '/requests/new', icon: DollarSign, roles: ['employee'] },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, roles: ['manager', 'hr', 'admin'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart, roles: ['manager', 'hr', 'admin'] },
    { name: 'All Requests', href: '/admin/requests', icon: FileText, roles: ['hr', 'admin'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['hr', 'admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['employee', 'manager', 'hr', 'admin'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'employee')
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <h1 className="text-xl font-semibold">Payment System</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user?.full_name}!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.department && `${user.department} • `}
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
