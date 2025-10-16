'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  ArrowLeft, 
  User,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Check,
  X
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface ApprovalHistory {
  approver_name: string
  status: string
  comments?: string
  approved_at: string
}

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
  supporting_documents: string[]
  approval_history: ApprovalHistory[]
  rejection_reason?: string
}

export default function RequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [request, setRequest] = useState<PaymentRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [comments, setComments] = useState('')

  const requestId = params.id as string

  useEffect(() => {
    if (requestId) {
      fetchRequest()
    }
  }, [requestId])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/requests/${requestId}`)
      setRequest(response.data)
      setError('')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch request details'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!request) return

    try {
      setActionLoading(true)
      
      const status = action === 'approve' ? 'approved_final' : 'rejected'
      
      await api.put(`/api/requests/${requestId}/approve`, {
        status,
        comments: comments.trim() || undefined
      })

      // Refresh request data
      await fetchRequest()
      setComments('')
      
    } catch (error: any) {
      const message = error.response?.data?.detail || `Failed to ${action} request`
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!request) return
    
    try {
      setActionLoading(true)
      setError('')
      
      const response = await api.get(`/api/reports/paycheck/${request.id}`, {
        responseType: 'blob' // Important for file download
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const filename = `paycheck_${request.id}_${new Date().toISOString().split('T')[0]}.pdf`
      link.setAttribute('download', filename)
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to generate PDF paycheck'
      setError(message)
      console.error('PDF generation error:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const canApprove = () => {
    if (!request || !user) return false
    
    // Only managers, HR, and admins can approve
    const canApproveRoles = ['manager', 'hr', 'admin']
    if (!canApproveRoles.includes(user.role)) return false
    
    // Can only approve pending requests
    if (request.status !== 'pending') return false
    
    // Users shouldn't approve their own requests
    if (request.employee_email === user.email) return false
    
    return true
  }

  const canGeneratePDF = () => {
    if (!request || !user) return false
    
    // Only generate PDF for approved requests
    const approvedStatuses = ['approved', 'approved_final']
    if (!approvedStatuses.includes(request.status)) return false
    
    // Allow request owner and managers/HR/admin to generate PDF
    const isRequestOwner = request.employee_email === user.email
    const canManage = ['manager', 'hr', 'admin'].includes(user.role)
    
    return isRequestOwner || canManage
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'approved':
      case 'approved_final':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
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

  const formatRequestType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading request details...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error && !request) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-medium">Error Loading Request</h3>
              </div>
              <p className="mb-4">{error}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchRequest}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!request) return null

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Request Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {formatRequestType(request.request_type)} - #{request.id.slice(-8)}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="font-medium">
                {request.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Request Information */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {formatRequestType(request.request_type)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${request.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-white mt-1 leading-relaxed">
                      {request.description}
                    </p>
                  </div>

                  {request.requested_payment_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Requested Payment Date</label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {formatDate(request.requested_payment_date)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Supporting Documents */}
              {request.supporting_documents && request.supporting_documents.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Supporting Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {request.supporting_documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-gray-900 dark:text-white">Document {index + 1}</span>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Approval History */}
              {request.approval_history && request.approval_history.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      Approval History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {request.approval_history.map((approval, index) => (
                        <div key={index} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {approval.approver_name}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(approval.status)}`}>
                              {approval.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {formatDate(approval.approved_at)}
                          </p>
                          {approval.comments && (
                            <p className="text-gray-900 dark:text-white">
                              {approval.comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {request.rejection_reason && (
                <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <XCircle className="w-5 h-5" />
                      Rejection Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-800 dark:text-red-300">
                      {request.rejection_reason}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Employee Info */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Employee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.employee_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.employee_email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(request.updated_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Generation - Only for approved requests */}
              {canGeneratePDF() && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Download className="w-5 h-5" />
                      Generate Paycheck
                    </CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-300">
                      Download official PDF paycheck document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGeneratePDF}
                      disabled={actionLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download PDF Paycheck
                    </Button>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                      Professional paycheck document with all payment details
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Approval Actions */}
              {canApprove() && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-orange-600 dark:text-orange-400">
                      Approval Required
                    </CardTitle>
                    <CardDescription>
                      Review this request and provide your decision
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="comments" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                          Comments (Optional)
                        </label>
                        <textarea
                          id="comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Add any comments about your decision..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproval('approve')}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleApproval('reject')}
                          disabled={actionLoading}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-600 rounded-full animate-spin mr-2"></div>
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}