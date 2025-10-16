'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface PaymentRequest {
  id: string
  employee_name: string
  employee_email: string
  request_type: string
  amount: number
  description: string
  status: string
  created_at: string
  updated_at: string
  requested_payment_date?: string
}

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/requests')
      setRequests(response.data)
      setError('')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch requests'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
      case 'approved_final':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      case 'approved':
      case 'approved_final':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status.toLowerCase() === filter
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => ['approved', 'approved_final'].includes(r.status)).length,
    rejected: requests.filter(r => r.status === 'rejected').length
  }

  return (
    <ProtectedRoute allowedRoles={['hr', 'admin']}>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All Payment Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review all payment requests across the organization
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              All Requests
            </Button>
            <Button
              onClick={() => setFilter('pending')}
              variant={filter === 'pending' ? 'default' : 'outline'}
            >
              Pending
            </Button>
            <Button
              onClick={() => setFilter('approved')}
              variant={filter === 'approved' ? 'default' : 'outline'}
            >
              Approved
            </Button>
            <Button
              onClick={() => setFilter('rejected')}
              variant={filter === 'rejected' ? 'default' : 'outline'}
            >
              Rejected
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Requests List */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">Payment Requests</CardTitle>
              <CardDescription>
                {filteredRequests.length} {filter === 'all' ? 'total' : filter} request(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No requests found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    {filter === 'all' ? 'There are no payment requests yet.' : `No ${filter} requests found.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(request.amount)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{request.employee_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{request.request_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(request.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Link href={`/requests/${request.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}