'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Upload, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

type RequestType = 'overtime' | 'bonus' | 'reimbursement' | 'salary_advance' | 'commission'

interface RequestFormData {
  request_type: RequestType
  amount: string
  description: string
  requested_payment_date: string
  supporting_documents: File[]
}

export default function NewRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState<RequestFormData>({
    request_type: 'overtime',
    amount: '',
    description: '',
    requested_payment_date: '',
    supporting_documents: []
  })

  const requestTypes: { value: RequestType; label: string; description: string }[] = [
    {
      value: 'overtime',
      label: 'Overtime Payment',
      description: 'Compensation for hours worked beyond regular schedule'
    },
    {
      value: 'bonus',
      label: 'Performance Bonus',
      description: 'Additional compensation for exceptional performance'
    },
    {
      value: 'reimbursement',
      label: 'Expense Reimbursement',
      description: 'Reimbursement for business-related expenses'
    },
    {
      value: 'salary_advance',
      label: 'Salary Advance',
      description: 'Advance payment against future salary'
    },
    {
      value: 'commission',
      label: 'Sales Commission',
      description: 'Commission payment for sales achievements'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      supporting_documents: files
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supporting_documents: prev.supporting_documents.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount')
      }
      
      if (!formData.description.trim()) {
        throw new Error('Please provide a description')
      }

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('request_type', formData.request_type)
      submitData.append('amount', formData.amount)
      submitData.append('description', formData.description)
      
      if (formData.requested_payment_date) {
        submitData.append('requested_payment_date', formData.requested_payment_date)
      }

      // Add files
      formData.supporting_documents.forEach((file, index) => {
        submitData.append(`supporting_documents`, file)
      })

      const response = await api.post('/api/requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Request submitted successfully! You will receive an email confirmation.')
      
      // Reset form
      setFormData({
        request_type: 'overtime',
        amount: '',
        description: '',
        requested_payment_date: '',
        supporting_documents: []
      })

      // Redirect to requests page after 2 seconds
      setTimeout(() => {
        router.push('/requests')
      }, 2000)

    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to submit request'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const selectedRequestType = requestTypes.find(type => type.value === formData.request_type)

  return (
    <ProtectedRoute allowedRoles={['employee', 'manager', 'hr', 'admin']}>
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Submit New Request
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new payment request for approval by your manager
            </p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                Request Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Fill out the form below to submit your payment request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Request Type */}
                <div className="space-y-3">
                  <label htmlFor="request_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Request Type
                  </label>
                  <select
                    id="request_type"
                    name="request_type"
                    value={formData.request_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {requestTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {selectedRequestType && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedRequestType.description}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-3">
                  <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount ($)
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Please provide detailed information about this request..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Requested Payment Date */}
                <div className="space-y-3">
                  <label htmlFor="requested_payment_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested Payment Date (Optional)
                  </label>
                  <Input
                    id="requested_payment_date"
                    name="requested_payment_date"
                    type="date"
                    value={formData.requested_payment_date}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label htmlFor="supporting_documents" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <input
                      id="supporting_documents"
                      name="supporting_documents"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="supporting_documents"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload files or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        PDF, DOC, JPG, PNG up to 10MB each
                      </span>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {formData.supporting_documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected Files:
                      </h4>
                      {formData.supporting_documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}