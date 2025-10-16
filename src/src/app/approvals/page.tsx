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
  Eye,
  Check,
  X
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

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/requests')
      // Filter to show only pending requests for approval
      const pendingRequests = response.data.filter((req: PaymentRequest) => req.status === 'pending')
      setRequests(pendingRequests)
      setError('')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch pending requests'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(requestId)
      
      const status = action === 'approve' ? 'approved_final' : 'rejected'
      
      await api.put(`/api/requests/${requestId}/approve`, {
        status,
        comments: `Quick ${action} from approvals page`
      })

      // Refresh the list
      await fetchPendingRequests()
      
    } catch (error: any) {
      const message = error.response?.data?.detail || `Failed to ${action} request`
      setError(message)
    } finally {
      setActionLoading(null)
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute allowedRoles={['manager', 'hr', 'admin']}>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pending Approvals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve pending payment requests
            </p>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(requests.reduce((sum, req) => sum + req.amount, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Review</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Pending Requests */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">Requests Awaiting Approval</CardTitle>
              <CardDescription>
                {requests.length} request(s) pending your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    No pending requests require your approval at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon(request.status)}
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(request.amount)}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                              PENDING APPROVAL
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                          
                          <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleQuickApproval(request.id, 'approve')}
                              disabled={actionLoading === request.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              {actionLoading === request.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleQuickApproval(request.id, 'reject')}
                              disabled={actionLoading === request.id}
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              size="sm"
                            >
                              {actionLoading === request.id ? (
                                <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                          <Link href={`/requests/${request.id}`}>
                            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
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