'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react'
import api from '@/lib/api'

interface AnalyticsData {
  summary: {
    total_requests: number
    approved_count: number
    pending_count: number
    rejected_count: number
    approval_rate: number
  }
  request_types: { [key: string]: number }
  monthly_trends: { [key: string]: number }
  amounts: {
    total_requested: number
    total_approved: number
    average_request: number
  }
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/reports/analytics')
      setAnalytics(response.data)
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      setReportLoading(true)
      setError('')
      
      // Check if PDF generation is available
      const response = await api.get('/api/reports/summary', {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const filename = `payment_summary_${new Date().toISOString().split('T')[0]}.pdf`
      link.setAttribute('download', filename)
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
    } catch (error: any) {
      console.error('Report generation error:', error)
      
      // Check if it's a PDF generation unavailable error
      if (error.response?.status === 500) {
        setError('PDF generation is currently unavailable. Please ensure ReportLab is installed on the server.')
      } else {
        const message = error.response?.data?.detail || 'Failed to generate report'
        setError(message)
      }
    } finally {
      setReportLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Simple chart component using CSS
  const SimpleBarChart = ({ data, title }: { data: { [key: string]: number }, title: string }) => {
    const maxValue = Math.max(...Object.values(data))
    const entries = Object.entries(data)

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{key}</span>
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error && !analytics) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Error Loading Analytics</h3>
              <p className="mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchAnalytics}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!analytics) return null

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Payment request insights and statistics
              </p>
            </div>
            
            {/* Download Report Button - Only for managers */}
            {user && ['manager', 'hr', 'admin'].includes(user.role) && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleDownloadReport}
                  disabled={reportLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {reportLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download Report
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  PDF generation requires ReportLab installation
                </p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Requests */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analytics.summary.total_requests}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Requests */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {analytics.summary.approved_count}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analytics.summary.pending_count}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Rate */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approval Rate</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {analytics.summary.approval_rate}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Request Types Chart */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-orange-500" />
                  Request Types Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of request types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={analytics.request_types} title="Requests by Type" />
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-orange-500" />
                  Monthly Trends
                </CardTitle>
                <CardDescription>
                  Request volume over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={analytics.monthly_trends} title="Requests by Month" />
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-300">
                Payment amounts and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Requested</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    ${analytics.amounts.total_requested.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Approved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${analytics.amounts.total_approved.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Average Request</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${analytics.amounts.average_request.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}