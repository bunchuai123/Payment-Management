export interface User {
  id?: string
  email: string
  full_name: string
  role: 'employee' | 'manager' | 'hr' | 'admin'
  department?: string
  manager_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  username: string // email
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role?: 'employee' | 'manager' | 'hr' | 'admin'
  department?: string
  manager_id?: string
}

export interface PaymentRequest {
  id?: string
  employee_id: string
  employee_name: string
  employee_email: string
  request_type: 'overtime' | 'bonus' | 'reimbursement' | 'salary_advance' | 'commission'
  amount: number
  description: string
  supporting_documents?: string[]
  status: 'pending' | 'approved_l1' | 'approved_l2' | 'approved_final' | 'rejected' | 'paid'
  approval_history: ApprovalHistory[]
  current_approver_id?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  requested_payment_date?: string
  actual_payment_date?: string
}

export interface ApprovalHistory {
  approver_id: string
  approver_name: string
  status: string
  comments?: string
  approved_at: string
}

export interface RequestCreate {
  request_type: 'overtime' | 'bonus' | 'reimbursement' | 'salary_advance' | 'commission'
  amount: number
  description: string
  supporting_documents?: string[]
  requested_payment_date?: string
}

export interface RequestApproval {
  status: 'approved_l1' | 'approved_l2' | 'approved_final' | 'rejected'
  comments?: string
}
