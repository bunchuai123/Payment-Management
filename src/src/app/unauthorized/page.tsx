'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
