'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DollarSign, 
  Shield, 
  Clock, 
  BarChart3,
  CheckCircle,
  Users,
  ArrowRight,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function Homepage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  
  if (user) {
    // Redirect to dashboard if already logged in
    window.location.href = '/dashboard'
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ organizations worldwide
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-orange-700 dark:from-white dark:via-orange-100 dark:to-orange-300 bg-clip-text text-transparent">
                Payment
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-orange-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Streamline your payment requests, approvals, and financial workflows with our comprehensive management system designed for modern businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/register">
                <Button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="outline" className="px-8 py-4 border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white dark:hover:text-black font-semibold text-lg backdrop-blur-sm transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-orange-600 dark:from-white dark:to-orange-200 bg-clip-text text-transparent">
                Everything you need to manage payments
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-orange-200 max-w-3xl mx-auto">
              From request submission to approval workflows, we have got you covered with enterprise-grade features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Payment Requests",
                description: "Submit and track payment requests with detailed documentation and approval workflows.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Shield,
                title: "Secure Approvals", 
                description: "Multi-level approval system with role-based permissions and audit trails.",
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: Clock,
                title: "Real-time Tracking",
                description: "Monitor payment status in real-time with automated notifications and updates.",
                color: "from-purple-500 to-violet-600"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive reporting and analytics to track spending and approval patterns.",
                color: "from-orange-500 to-red-600"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Collaborate with team members and stakeholders throughout the approval process.",
                color: "from-pink-500 to-rose-600"
              },
              {
                icon: CheckCircle,
                title: "Compliance Ready",
                description: "Built-in compliance features to meet regulatory requirements and audit standards.",
                color: "from-indigo-500 to-purple-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="group bg-gray-50 dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-orange-200 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-600/10 rounded-3xl p-12 backdrop-blur-xl border border-gray-200 dark:border-white/10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-orange-600 dark:from-white dark:to-orange-200 bg-clip-text text-transparent">
                  Ready to get started?
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-orange-200 mb-8 max-w-2xl mx-auto">
                Join thousands of organizations already using our platform to streamline their payment management processes.
              </p>
              <Link href="/register">
                <Button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 
