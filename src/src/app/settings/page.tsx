'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon, 
  Save, 
  Eye, 
  EyeOff,
  Building,
  Mail,
  Phone,
  Calendar,
  Globe,
  Lock,
  Key,
  Monitor,
  Moon,
  Sun
} from 'lucide-react'

interface UserSettings {
  profile: {
    name: string
    email: string
    phone: string
    department: string
    position: string
  }
  notifications: {
    emailNotifications: boolean
    requestUpdates: boolean
    approvalReminders: boolean
    systemUpdates: boolean
    notificationFrequency: 'immediate' | 'daily' | 'weekly'
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    passwordLastChanged: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dateFormat: string
    currency: string
  }
}

interface CompanySettings {
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    logo: string
  }
  paymentSettings: {
    categories: string[]
    approvalLimits: Record<string, number>
    defaultCurrency: string
  }
  systemSettings: {
    maxFileSize: number
    allowedFileTypes: string[]
    autoApprovalLimit: number
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [userSettings, setUserSettings] = useState<UserSettings>({
    profile: {
      name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      department: user?.department || '',
      position: user?.role || ''
    },
    notifications: {
      emailNotifications: true,
      requestUpdates: true,
      approvalReminders: true,
      systemUpdates: false,
      notificationFrequency: 'immediate'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 60,
      passwordLastChanged: '2025-10-01'
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      currency: 'USD'
    }
  })

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyInfo: {
      name: 'Aeva Technologies',
      address: '123 Business Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@aeva.com',
      website: 'https://aeva.com',
      logo: ''
    },
    paymentSettings: {
      categories: ['Overtime', 'Reimbursement', 'Bonus', 'Travel Expense', 'Equipment'],
      approvalLimits: {
        'manager': 1000,
        'hr': 5000,
        'admin': 999999
      },
      defaultCurrency: 'USD'
    },
    systemSettings: {
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
      autoApprovalLimit: 50
    }
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  // Load user settings from API on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return
      
      try {
        const response = await fetch('http://localhost:8001/api/user/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const settings = await response.json()
          setUserSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, ...settings.profile },
            notifications: { ...prev.notifications, ...settings.notifications },
            security: { ...prev.security, ...settings.security },
            preferences: { ...prev.preferences, ...settings.preferences }
          }))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    
    loadSettings()
  }, [user])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, roles: ['employee', 'manager', 'hr', 'admin'] },
    { id: 'notifications', name: 'Notifications', icon: Bell, roles: ['employee', 'manager', 'hr', 'admin'] },
    { id: 'security', name: 'Security', icon: Shield, roles: ['employee', 'manager', 'hr', 'admin'] },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon, roles: ['employee', 'manager', 'hr', 'admin'] },
    { id: 'company', name: 'Company', icon: Building, roles: ['hr', 'admin'] },
    { id: 'system', name: 'System', icon: Monitor, roles: ['admin'] }
  ].filter(tab => tab.roles.includes(user?.role || 'employee'))

  const handleSaveProfile = async () => {
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:8001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userSettings.profile)
      })

      if (response.ok) {
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:8001/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setSuccessMessage('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to change password')
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to change password. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (settingType: string) => {
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      let endpoint = ''
      let data = {}

      switch (settingType) {
        case 'notifications':
          endpoint = 'http://localhost:8001/api/user/notifications'
          data = userSettings.notifications
          break
        case 'security':
          endpoint = 'http://localhost:8001/api/user/security'
          data = userSettings.security
          break
        case 'preferences':
          endpoint = 'http://localhost:8001/api/user/preferences'
          data = userSettings.preferences
          break
        case 'company':
          endpoint = 'http://localhost:8001/api/admin/company'
          data = companySettings.companyInfo
          break
        case 'system':
          endpoint = 'http://localhost:8001/api/admin/system'
          data = companySettings.systemSettings
          break
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSuccessMessage('Settings updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      setErrorMessage('Failed to update settings. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userSettings.profile.name}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        profile: { ...userSettings.profile, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userSettings.profile.email}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        profile: { ...userSettings.profile, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userSettings.profile.phone}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        profile: { ...userSettings.profile, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={userSettings.profile.department}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        profile: { ...userSettings.profile, department: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => setUserSettings({
                        ...userSettings,
                        notifications: { 
                          ...userSettings.notifications, 
                          emailNotifications: !userSettings.notifications.emailNotifications 
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userSettings.notifications.emailNotifications ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userSettings.notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Request Updates</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your requests are updated</p>
                    </div>
                    <button
                      onClick={() => setUserSettings({
                        ...userSettings,
                        notifications: { 
                          ...userSettings.notifications, 
                          requestUpdates: !userSettings.notifications.requestUpdates 
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userSettings.notifications.requestUpdates ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userSettings.notifications.requestUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Approval Reminders</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive reminders for pending approvals</p>
                    </div>
                    <button
                      onClick={() => setUserSettings({
                        ...userSettings,
                        notifications: { 
                          ...userSettings.notifications, 
                          approvalReminders: !userSettings.notifications.approvalReminders 
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userSettings.notifications.approvalReminders ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userSettings.notifications.approvalReminders ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">System Updates</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications about system updates</p>
                    </div>
                    <button
                      onClick={() => setUserSettings({
                        ...userSettings,
                        notifications: { 
                          ...userSettings.notifications, 
                          systemUpdates: !userSettings.notifications.systemUpdates 
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userSettings.notifications.systemUpdates ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userSettings.notifications.systemUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={userSettings.notifications.notificationFrequency}
                    onChange={(e) => setUserSettings({
                      ...userSettings,
                      notifications: { 
                        ...userSettings.notifications, 
                        notificationFrequency: e.target.value as 'immediate' | 'daily' | 'weekly'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSettings('notifications')}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Notifications'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setUserSettings({
                        ...userSettings,
                        security: { 
                          ...userSettings.security, 
                          twoFactorEnabled: !userSettings.security.twoFactorEnabled 
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userSettings.security.twoFactorEnabled ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userSettings.security.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={userSettings.security.sessionTimeout}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        security: { 
                          ...userSettings.security, 
                          sessionTimeout: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Password last changed: {userSettings.security.passwordLastChanged}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      We recommend changing your password every 90 days for better security.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSettings('security')}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Security'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={userSettings.preferences.theme}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        preferences: { 
                          ...userSettings.preferences, 
                          theme: e.target.value as 'light' | 'dark' | 'system'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={userSettings.preferences.language}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        preferences: { 
                          ...userSettings.preferences, 
                          language: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={userSettings.preferences.timezone}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        preferences: { 
                          ...userSettings.preferences, 
                          timezone: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={userSettings.preferences.dateFormat}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        preferences: { 
                          ...userSettings.preferences, 
                          dateFormat: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                      <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                      <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={userSettings.preferences.currency}
                      onChange={(e) => setUserSettings({
                        ...userSettings,
                        preferences: { 
                          ...userSettings.preferences, 
                          currency: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSettings('preferences')}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'company' && isAdmin && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Company Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companySettings.companyInfo.name}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        companyInfo: { ...companySettings.companyInfo, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={companySettings.companyInfo.email}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        companyInfo: { ...companySettings.companyInfo, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Phone
                    </label>
                    <input
                      type="tel"
                      value={companySettings.companyInfo.phone}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        companyInfo: { ...companySettings.companyInfo, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={companySettings.companyInfo.website}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        companyInfo: { ...companySettings.companyInfo, website: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Address
                  </label>
                  <textarea
                    value={companySettings.companyInfo.address}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      companyInfo: { ...companySettings.companyInfo, address: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Payment Categories */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Categories</h3>
                  <div className="space-y-2">
                    {companySettings.paymentSettings.categories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...companySettings.paymentSettings.categories]
                            newCategories[index] = e.target.value
                            setCompanySettings({
                              ...companySettings,
                              paymentSettings: { 
                                ...companySettings.paymentSettings, 
                                categories: newCategories 
                              }
                            })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            const newCategories = companySettings.paymentSettings.categories.filter((_, i) => i !== index)
                            setCompanySettings({
                              ...companySettings,
                              paymentSettings: { 
                                ...companySettings.paymentSettings, 
                                categories: newCategories 
                              }
                            })
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setCompanySettings({
                          ...companySettings,
                          paymentSettings: { 
                            ...companySettings.paymentSettings, 
                            categories: [...companySettings.paymentSettings.categories, ''] 
                          }
                        })
                      }}
                      className="px-4 py-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSettings('company')}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Company'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'system' && user?.role === 'admin' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={companySettings.systemSettings.maxFileSize}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        systemSettings: { 
                          ...companySettings.systemSettings, 
                          maxFileSize: parseInt(e.target.value) 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auto-Approval Limit ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={companySettings.systemSettings.autoApprovalLimit}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        systemSettings: { 
                          ...companySettings.systemSettings, 
                          autoApprovalLimit: parseInt(e.target.value) 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed File Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['pdf', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={companySettings.systemSettings.allowedFileTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCompanySettings({
                                ...companySettings,
                                systemSettings: {
                                  ...companySettings.systemSettings,
                                  allowedFileTypes: [...companySettings.systemSettings.allowedFileTypes, type]
                                }
                              })
                            } else {
                              setCompanySettings({
                                ...companySettings,
                                systemSettings: {
                                  ...companySettings.systemSettings,
                                  allowedFileTypes: companySettings.systemSettings.allowedFileTypes.filter(t => t !== type)
                                }
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">.{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSettings('system')}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save System'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}