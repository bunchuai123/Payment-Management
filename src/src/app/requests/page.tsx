'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
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

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'approved':
      case 'approved_final':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800'
    }
  }

  const formatRequestType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role === 'employee' ? 'Your payment requests' : 'Manage payment requests'}
              </p>
            </div>
            
            {(user?.role === 'employee' || user?.role === 'manager') && (
              <Link href="/requests/new">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Showing {filteredRequests.length} of {requests.length} requests
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRequests}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter ? 'No matching requests' : 'No requests yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating your first payment request'
                  }
                </p>
                {!searchTerm && !statusFilter && (user?.role === 'employee' || user?.role === 'manager') && (
                  <Link href="/requests/new">
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Request
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Request Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatRequestType(request.request_type)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              by {request.employee_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${request.amount.toLocaleString()}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {formatDate(request.created_at)}
                          </div>
                          {request.requested_payment_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Due {formatDate(request.requested_payment_date)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/requests/${request.id}`}>
                          <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}